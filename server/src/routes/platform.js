const express = require('express');
const ConsentRecord = require('../models/ConsentRecord');
const SecureMessage = require('../models/SecureMessage');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { auth, requireRole } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

// ============== CONSENT ==============

// GET /api/consent
router.get('/consent', auth, async (req, res) => {
  try {
    const { caseId } = req.query;
    const query = { userId: req.userId };
    if (caseId) query.caseId = caseId;

    const records = await ConsentRecord.find(query).sort('-timestamp');
    res.json({ records });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch consent records' });
  }
});

// POST /api/consent
router.post('/consent', auth, validate(schemas.consent), async (req, res) => {
  try {
    const { caseId, consentType, granted } = req.body;

    // Check for existing consent of same type
    const existing = await ConsentRecord.findOne({
      userId: req.userId,
      caseId: caseId || null,
      consentType,
      revokedAt: null
    });

    if (existing) {
      existing.granted = granted;
      if (!granted) existing.revokedAt = new Date();
      existing.timestamp = new Date();
      await existing.save();

      await AuditLog.create({
        userId: req.userId,
        userName: req.user.name,
        action: granted ? 'CONSENT_UPDATED' : 'CONSENT_REVOKED',
        caseId,
        targetType: 'consent',
        targetId: existing._id,
        description: `Consent ${consentType}: ${granted ? 'granted' : 'revoked'}`,
        ipAddress: req.ip
      });

      return res.json({ message: 'Consent updated', consent: existing });
    }

    const consent = await ConsentRecord.create({
      userId: req.userId,
      caseId,
      consentType,
      granted
    });

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'CONSENT_CREATED',
      caseId,
      targetType: 'consent',
      targetId: consent._id,
      description: `Consent ${consentType}: ${granted ? 'granted' : 'denied'}`,
      ipAddress: req.ip
    });

    res.status(201).json({ message: 'Consent recorded', consent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

// PATCH /api/consent/:id
router.patch('/consent/:id', auth, async (req, res) => {
  try {
    const consent = await ConsentRecord.findById(req.params.id);
    if (!consent) return res.status(404).json({ error: 'Consent record not found' });
    if (consent.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (req.body.granted !== undefined) consent.granted = req.body.granted;
    if (!req.body.granted) consent.revokedAt = new Date();
    consent.timestamp = new Date();
    await consent.save();

    res.json({ message: 'Consent updated', consent });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update consent' });
  }
});

// ============== MESSAGES ==============

// GET /api/messages
router.get('/messages', auth, async (req, res) => {
  try {
    const { caseId } = req.query;
    const query = {
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    };
    if (caseId) query.caseId = caseId;

    const messages = await SecureMessage.find(query)
      .sort('-createdAt')
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role');

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// GET /api/messages/:caseId (client calls this route directly)
router.get('/messages/:caseId', auth, async (req, res) => {
  try {
    const messages = await SecureMessage.find({
      caseId: req.params.caseId,
      $or: [{ senderId: req.userId }, { receiverId: req.userId }]
    })
      .sort('-createdAt')
      .populate('senderId', 'name role')
      .populate('receiverId', 'name role');

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /api/messages
router.post('/messages', auth, validate(schemas.sendMessage), async (req, res) => {
  try {
    const { receiverId, recipientId, caseId, message, content } = req.body;
    const actualReceiverId = receiverId || recipientId;
    const actualMessage = message || content;

    const receiver = await User.findById(actualReceiverId);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    const msg = await SecureMessage.create({
      senderId: req.userId,
      receiverId: actualReceiverId,
      caseId,
      message: actualMessage
    });

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'MESSAGE_SENT',
      caseId,
      targetType: 'message',
      targetId: msg._id,
      description: `Secure message sent to ${receiver.name}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Message sent',
      data: {
        id: msg._id,
        caseId: msg.caseId,
        createdAt: msg.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ============== AUDIT LOGS ==============

// GET /api/audit-logs
router.get('/audit-logs', auth, requireRole('admin', 'investigator'), async (req, res) => {
  try {
    const { caseId, userId, action, page = 1, limit = 50 } = req.query;
    const query = {};
    if (caseId) query.caseId = caseId;
    if (userId) query.userId = userId;
    if (action) query.action = action;

    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .sort('-timestamp')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name role');

    res.json({ logs, total, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// ============== ADMIN ==============

// GET /api/admin/users
router.get('/admin/users', auth, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -otpHash').sort('-createdAt');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/admin/users/:id/status
router.patch('/admin/users/:id/status', auth, requireRole('admin'), async (req, res) => {
  try {
    const { verificationStatus, role } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (verificationStatus) user.verificationStatus = verificationStatus;
    if (role) user.role = role;
    await user.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'USER_STATUS_UPDATED',
      targetType: 'user',
      targetId: user._id,
      description: `User ${user.name} status updated`,
      metadata: { verificationStatus, role },
      ipAddress: req.ip
    });

    res.json({ message: 'User updated', user: user.toPublicJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ============== DASHBOARD STATS ==============

// GET /api/dashboard/stats
router.get('/dashboard/stats', auth, async (req, res) => {
  try {
    const MissingCase = require('../models/MissingCase');
    const Evidence = require('../models/Evidence');
    const Sighting = require('../models/Sighting');
    const MatchLead = require('../models/MatchLead');
    const CaseCluster = require('../models/CaseCluster');
    const PatternAlert = require('../models/PatternAlert');

    const [
      totalCases, activeCases, highPriorityCases, criticalCases,
      totalSightings, pendingSightings,
      totalEvidence, pendingEvidence,
      totalLeads, pendingLeads,
      totalClusters, pendingClusters,
      totalAlerts, pendingAlerts
    ] = await Promise.all([
      MissingCase.countDocuments(),
      MissingCase.countDocuments({ status: 'active' }),
      MissingCase.countDocuments({ priority: 'high' }),
      MissingCase.countDocuments({ priority: 'critical' }),
      Sighting.countDocuments(),
      Sighting.countDocuments({ reviewStatus: 'pending' }),
      Evidence.countDocuments(),
      Evidence.countDocuments({ processingStatus: 'pending' }),
      MatchLead.countDocuments(),
      MatchLead.countDocuments({ status: 'POTENTIAL_LEAD' }),
      CaseCluster.countDocuments(),
      CaseCluster.countDocuments({ reviewStatus: 'pending' }),
      PatternAlert.countDocuments(),
      PatternAlert.countDocuments({ reviewStatus: 'pending' })
    ]);

    // Recent activity
    const recentActivity = await AuditLog.find()
      .sort('-timestamp')
      .limit(10)
      .populate('userId', 'name');

    // Cases by status for chart
    const casesByStatus = await MissingCase.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Cases by priority
    const casesByPriority = await MissingCase.aggregate([
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    // Monthly case trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyTrend = await MissingCase.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      stats: {
        cases: { total: totalCases, active: activeCases, highPriority: highPriorityCases, critical: criticalCases },
        sightings: { total: totalSightings, pending: pendingSightings },
        evidence: { total: totalEvidence, pending: pendingEvidence },
        leads: { total: totalLeads, pending: pendingLeads },
        clusters: { total: totalClusters, pending: pendingClusters },
        alerts: { total: totalAlerts, pending: pendingAlerts }
      },
      charts: { casesByStatus, casesByPriority, monthlyTrend },
      recentActivity
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

module.exports = router;
