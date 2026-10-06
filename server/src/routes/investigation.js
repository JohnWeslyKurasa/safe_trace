const express = require('express');
const CaseCluster = require('../models/CaseCluster');
const PatternAlert = require('../models/PatternAlert');
const MatchLead = require('../models/MatchLead');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// GET /api/clusters
router.get('/clusters', auth, async (req, res) => {
  try {
    const { status, type } = req.query;
    const query = {};
    if (status) query.reviewStatus = status;
    if (type) query.relationshipType = type;

    const clusters = await CaseCluster.find(query)
      .sort('-createdAt')
      .populate('reviewedBy', 'name');

    res.json({ clusters });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch clusters' });
  }
});

// GET /api/clusters/:id
router.get('/clusters/:id', auth, async (req, res) => {
  try {
    const cluster = await CaseCluster.findOne({ clusterId: req.params.id })
      .populate('reviewedBy', 'name');
    if (!cluster) return res.status(404).json({ error: 'Cluster not found' });
    res.json({ cluster });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cluster' });
  }
});

// POST /api/clusters/:id/review
router.post('/clusters/:id/review', auth, requireRole('investigator', 'admin'), validate(schemas.clusterReview), async (req, res) => {
  try {
    const cluster = await CaseCluster.findOne({ clusterId: req.params.id });
    if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

    cluster.reviewStatus = req.body.reviewStatus;
    cluster.reviewNotes = req.body.reviewNotes || cluster.reviewNotes;
    cluster.reviewedBy = req.userId;
    cluster.reviewedAt = new Date();
    await cluster.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'CLUSTER_REVIEWED',
      targetType: 'cluster',
      targetId: cluster.clusterId,
      description: `Cluster reviewed: ${req.body.reviewStatus}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Cluster reviewed', cluster });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review cluster' });
  }
});

// GET /api/pattern-alerts
router.get('/pattern-alerts', auth, async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.reviewStatus = status;

    const alerts = await PatternAlert.find(query).sort('-createdAt');
    res.json({ alerts });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// POST /api/pattern-alerts/:id/ack (client acknowledge endpoint)
router.post('/pattern-alerts/:id/ack', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const alert = await PatternAlert.findOne({ alertId: req.params.id });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    alert.reviewStatus = 'reviewed';
    alert.reviewedBy = req.userId;
    await alert.save();

    res.json({ alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to acknowledge alert' });
  }
});

// PATCH /api/pattern-alerts/:id/review
router.patch('/pattern-alerts/:id/review', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const alert = await PatternAlert.findOne({ alertId: req.params.id });
    if (!alert) return res.status(404).json({ error: 'Alert not found' });

    if (req.body.reviewStatus) alert.reviewStatus = req.body.reviewStatus;
    if (req.body.reviewNotes) alert.reviewNotes = req.body.reviewNotes;
    alert.reviewedBy = req.userId;
    await alert.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'PATTERN_ALERT_REVIEWED',
      targetType: 'pattern_alert',
      targetId: alert.alertId,
      description: `Pattern alert reviewed: ${req.body.reviewStatus}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Alert reviewed', alert });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review alert' });
  }
});

// GET /api/leads
router.get('/leads', auth, async (req, res) => {
  try {
    const { status, caseId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (caseId) query.caseId = caseId;

    const leads = await MatchLead.find(query)
      .sort('-createdAt')
      .populate('humanReview.reviewedBy', 'name');

    res.json({ leads });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// POST /api/leads/:id/verify (client alias for /review)
router.post('/leads/:id/verify', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const lead = await MatchLead.findOne({ leadId: req.params.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const previousStatus = lead.status;
    lead.status = req.body.decision === 'verified' ? 'APPROVED'
      : req.body.decision === 'rejected' ? 'REJECTED'
      : 'NEEDS_MORE_INFO';
    lead.humanReview = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      action: req.body.decision,
      notes: req.body.notes || '',
      previousStatus,
      newStatus: lead.status,
      evidenceUsed: []
    };
    lead.identityConfirmed = false;
    await lead.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'LEAD_REVIEWED',
      caseId: lead.caseId,
      targetType: 'lead',
      targetId: lead.leadId,
      description: `Lead verified: ${previousStatus} → ${lead.status}`,
      metadata: { notes: req.body.notes, previousStatus, newStatus: lead.status },
      ipAddress: req.ip
    });

    res.json({ lead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to verify lead' });
  }
});

// POST /api/leads/:id/review
router.post('/leads/:id/review', auth, requireRole('investigator', 'admin'), validate(schemas.reviewLead), async (req, res) => {
  try {
    const lead = await MatchLead.findOne({ leadId: req.params.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    const previousStatus = lead.status;
    const statusMap = {
      approve: 'APPROVED',
      reject: 'REJECTED',
      needs_more_info: 'NEEDS_MORE_INFO',
      under_review: 'UNDER_REVIEW'
    };

    lead.status = statusMap[req.body.action] || lead.status;
    lead.humanReview = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      action: req.body.action,
      notes: req.body.notes || '',
      previousStatus,
      newStatus: lead.status,
      evidenceUsed: req.body.evidenceUsed || []
    };

    // Never allow automatic identity confirmation
    lead.identityConfirmed = false;
    await lead.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'LEAD_REVIEWED',
      caseId: lead.caseId,
      targetType: 'lead',
      targetId: lead.leadId,
      description: `Lead ${req.body.action}: ${previousStatus} → ${lead.status}`,
      metadata: { notes: req.body.notes, previousStatus, newStatus: lead.status },
      ipAddress: req.ip
    });

    res.json({ message: 'Lead reviewed', lead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to review lead' });
  }
});

// POST /api/leads/:id/request-information
router.post('/leads/:id/request-information', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const lead = await MatchLead.findOne({ leadId: req.params.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'NEEDS_MORE_INFO';
    lead.humanReview = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      action: 'request_information',
      notes: req.body.notes || 'Additional information requested',
      previousStatus: lead.status,
      newStatus: 'NEEDS_MORE_INFO'
    };
    await lead.save();

    res.json({ message: 'Information requested', lead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lead' });
  }
});

// POST /api/leads/:id/reject
router.post('/leads/:id/reject', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const lead = await MatchLead.findOne({ leadId: req.params.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'REJECTED';
    lead.humanReview = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      action: 'reject',
      notes: req.body.notes || '',
      previousStatus: lead.status,
      newStatus: 'REJECTED'
    };
    lead.identityConfirmed = false;
    await lead.save();

    res.json({ message: 'Lead rejected', lead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reject lead' });
  }
});

// POST /api/leads/:id/approve-for-investigation
router.post('/leads/:id/approve-for-investigation', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const lead = await MatchLead.findOne({ leadId: req.params.id });
    if (!lead) return res.status(404).json({ error: 'Lead not found' });

    lead.status = 'APPROVED';
    lead.humanReview = {
      reviewedBy: req.userId,
      reviewedAt: new Date(),
      action: 'approve_for_investigation',
      notes: req.body.notes || '',
      previousStatus: lead.status,
      newStatus: 'APPROVED'
    };
    lead.identityConfirmed = false;
    await lead.save();

    res.json({ message: 'Lead approved for further investigation', lead });
  } catch (error) {
    res.status(500).json({ error: 'Failed to approve lead' });
  }
});

module.exports = router;
