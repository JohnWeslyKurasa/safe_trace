const express = require('express');
const Sighting = require('../models/Sighting');
const MissingCase = require('../models/MissingCase');
const AuditLog = require('../models/AuditLog');
const { auth, optionalAuth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validate');

const router = express.Router();

const generateSightingId = () => `SG-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

// POST /api/sightings
router.post('/', optionalAuth, validate(schemas.createSighting), async (req, res) => {
  try {
    const sighting = new Sighting({
      ...req.body,
      sightingId: generateSightingId(),
      submittedBy: req.userId || null,
      reviewStatus: 'pending'
    });

    await sighting.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user?.name || 'Anonymous',
      action: 'SIGHTING_SUBMITTED',
      targetType: 'sighting',
      targetId: sighting.sightingId,
      description: `Sighting submitted at ${sighting.location?.city || 'unknown location'}`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Sighting submitted successfully. It will be reviewed by an authorized investigator.',
      sighting: {
        sightingId: sighting.sightingId,
        reviewStatus: sighting.reviewStatus,
        createdAt: sighting.createdAt
      }
    });
  } catch (error) {
    console.error('Submit sighting error:', error);
    res.status(500).json({ error: 'Failed to submit sighting' });
  }
});

// GET /api/sightings
router.get('/', auth, async (req, res) => {
  try {
    const { status, caseId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.reviewStatus = status;
    if (caseId) query.relatedCaseIds = caseId;

    // Public/family can only see their own sightings
    if (req.user.role === 'public' || req.user.role === 'family') {
      query.submittedBy = req.userId;
    }

    const total = await Sighting.countDocuments(query);
    const sightings = await Sighting.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('submittedBy', 'name');

    res.json({
      sightings,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sightings' });
  }
});

// GET /api/sightings/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const sighting = await Sighting.findOne({ sightingId: req.params.id })
      .populate('submittedBy', 'name')
      .populate('reviewedBy', 'name');

    if (!sighting) {
      return res.status(404).json({ error: 'Sighting not found' });
    }

    res.json({ sighting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sighting' });
  }
});

// PATCH /api/sightings/:id
router.patch('/:id', auth, async (req, res) => {
  try {
    const sighting = await Sighting.findOne({ sightingId: req.params.id });
    if (!sighting) {
      return res.status(404).json({ error: 'Sighting not found' });
    }

    // Update review status if investigator/admin
    if (['investigator', 'admin'].includes(req.user.role)) {
      if (req.body.reviewStatus) {
        sighting.reviewStatus = req.body.reviewStatus;
        sighting.reviewedBy = req.userId;
        sighting.reviewedAt = new Date();
      }
      if (req.body.reviewNotes) sighting.reviewNotes = req.body.reviewNotes;
      if (req.body.relatedCaseIds) sighting.relatedCaseIds = req.body.relatedCaseIds;
    }

    await sighting.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'SIGHTING_UPDATED',
      targetType: 'sighting',
      targetId: sighting.sightingId,
      description: `Sighting updated: ${req.body.reviewStatus || 'details modified'}`,
      ipAddress: req.ip
    });

    res.json({ message: 'Sighting updated', sighting });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sighting' });
  }
});

module.exports = router;
