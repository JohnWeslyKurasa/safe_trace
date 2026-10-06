const express = require('express');
const MissingCase = require('../models/MissingCase');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole, optionalAuth, auditAction } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

const generateCaseId = () => `MP-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

// POST /api/cases - Create case
router.post('/', auth, requireRole('family', 'investigator', 'admin'), validate(schemas.createCase), async (req, res) => {
  try {
    const caseData = {
      ...req.body,
      caseId: generateCaseId(),
      createdBy: req.userId
    };

    const newCase = new MissingCase(caseData);
    await newCase.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'CASE_CREATED',
      caseId: newCase.caseId,
      targetType: 'case',
      targetId: newCase.caseId,
      description: `Case created: ${newCase.name}`,
      ipAddress: req.ip
    });

    res.status(201).json({ message: 'Case created successfully', case: newCase });
  } catch (error) {
    console.error('Create case error:', error);
    res.status(500).json({ error: 'Failed to create case' });
  }
});

// GET /api/cases - List cases
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { search, status, priority, page = 1, limit = 20, sort = '-createdAt' } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { caseId: { $regex: search, $options: 'i' } },
        { 'lastKnownLocation.city': { $regex: search, $options: 'i' } },
        { circumstances: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Public users can only see public cases
    if (!req.user || req.user.role === 'public') {
      query['visibilitySettings.publicVisible'] = true;
    }

    const total = await MissingCase.countDocuments(query);
    const cases = await MissingCase.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'name')
      .lean();

    // Redact sensitive info for public users
    const redactedCases = cases.map(c => {
      if (!req.user || req.user.role === 'public') {
        delete c.contactInfo;
        if (!c.visibilitySettings?.locationVisible) {
          if (c.lastKnownLocation) {
            c.lastKnownLocation = { city: c.lastKnownLocation.city, state: c.lastKnownLocation.state };
          }
        }
      }
      return c;
    });

    res.json({
      cases: redactedCases,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('List cases error:', error);
    res.status(500).json({ error: 'Failed to fetch cases' });
  }
});

// GET /api/cases/:id
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const caseDoc = await MissingCase.findOne({ caseId: req.params.id })
      .populate('createdBy', 'name')
      .populate('timeline.addedBy', 'name');

    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    const caseObj = caseDoc.toObject();

    // Redact for public/unauthorized
    if (!req.user || req.user.role === 'public') {
      if (!caseObj.visibilitySettings?.publicVisible) {
        return res.status(403).json({ error: 'This case is not publicly visible' });
      }
      delete caseObj.contactInfo;
      if (!caseObj.visibilitySettings?.locationVisible) {
        if (caseObj.lastKnownLocation) {
          caseObj.lastKnownLocation = { city: caseObj.lastKnownLocation.city, state: caseObj.lastKnownLocation.state };
        }
      }
    }

    if (req.user) {
      await AuditLog.create({
        userId: req.userId,
        userName: req.user.name,
        action: 'CASE_VIEWED',
        caseId: caseDoc.caseId,
        targetType: 'case',
        targetId: caseDoc.caseId,
        ipAddress: req.ip
      });
    }

    res.json({ case: caseObj });
  } catch (error) {
    console.error('Get case error:', error);
    res.status(500).json({ error: 'Failed to fetch case' });
  }
});

// PATCH /api/cases/:id
router.patch('/:id', auth, requireRole('family', 'investigator', 'admin'), validate(schemas.updateCase), async (req, res) => {
  try {
    const caseDoc = await MissingCase.findOne({ caseId: req.params.id });
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Only creator, investigator, or admin can edit
    if (caseDoc.createdBy.toString() !== req.userId.toString() &&
        !['investigator', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Not authorized to edit this case' });
    }

    Object.assign(caseDoc, req.body);
    await caseDoc.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'CASE_UPDATED',
      caseId: caseDoc.caseId,
      targetType: 'case',
      targetId: caseDoc.caseId,
      description: 'Case updated',
      metadata: { fields: Object.keys(req.body) },
      ipAddress: req.ip
    });

    res.json({ message: 'Case updated', case: caseDoc });
  } catch (error) {
    console.error('Update case error:', error);
    res.status(500).json({ error: 'Failed to update case' });
  }
});

// DELETE /api/cases/:id
router.delete('/:id', auth, requireRole('admin'), async (req, res) => {
  try {
    const result = await MissingCase.findOneAndDelete({ caseId: req.params.id });
    if (!result) {
      return res.status(404).json({ error: 'Case not found' });
    }

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'CASE_DELETED',
      caseId: req.params.id,
      targetType: 'case',
      ipAddress: req.ip
    });

    res.json({ message: 'Case deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
});

// GET /api/cases/:id/stats - Dashboard stats
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const caseDoc = await MissingCase.findOne({ caseId: req.params.id });
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    const Evidence = require('../models/Evidence');
    const Sighting = require('../models/Sighting');
    const MatchLead = require('../models/MatchLead');

    const [evidenceCount, sightingCount, leadCount] = await Promise.all([
      Evidence.countDocuments({ caseId: req.params.id }),
      Sighting.countDocuments({ relatedCaseIds: req.params.id }),
      MatchLead.countDocuments({ caseId: req.params.id })
    ]);

    res.json({
      stats: { evidenceCount, sightingCount, leadCount, timeline: caseDoc.timeline?.length || 0 }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
