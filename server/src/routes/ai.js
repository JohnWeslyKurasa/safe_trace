const express = require('express');
const MissingCase = require('../models/MissingCase');
const Evidence = require('../models/Evidence');
const Sighting = require('../models/Sighting');
const CaseCluster = require('../models/CaseCluster');
const MatchLead = require('../models/MatchLead');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');
const aiService = require('../services/aiService');

const router = express.Router();

const generateLeadId = () => `LD-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

// POST /api/ai/evidence/:id/analyze
router.post('/evidence/:id/analyze', auth, requireRole('investigator', 'admin', 'family'), async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id });
    if (!evidence) return res.status(404).json({ error: 'Evidence not found' });

    let fileBuffer = null;
    const fs = require('fs');
    if (evidence.storagePath && fs.existsSync(evidence.storagePath)) {
      fileBuffer = fs.readFileSync(evidence.storagePath);
    }

    const analysis = await aiService.analyzeEvidence(evidence, fileBuffer);

    // Update evidence
    evidence.processingStatus = 'completed';
    evidence.extractedFacts = analysis.extractedFacts || [];
    evidence.aiAnalysis = analysis;
    evidence.confidence = analysis.confidence || 0;
    evidence.transcript = analysis.transcript || evidence.transcript;
    evidence.extractedText = analysis.textDetected || evidence.extractedText;
    if (analysis.keyframes) {
      evidence.metadata = evidence.metadata || {};
      evidence.metadata.keyframes = analysis.keyframes;
    }
    evidence.sourceReferences = analysis.sourceReferences || [];
    await evidence.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'AI_EVIDENCE_ANALYSIS',
      caseId: evidence.caseId,
      evidenceId: evidence.evidenceId,
      targetType: 'evidence',
      ipAddress: req.ip
    });

    res.json({ analysis, evidence: { evidenceId: evidence.evidenceId, processingStatus: 'completed' } });
  } catch (error) {
    console.error('AI evidence analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// POST /api/ai/cases/:id/age-analysis
router.post('/cases/:id/age-analysis', auth, requireRole('investigator', 'admin', 'family'), async (req, res) => {
  try {
    const caseDoc = await MissingCase.findOne({ caseId: req.params.id });
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    if (!caseDoc.ageWhenMissing || !caseDoc.estimatedCurrentAge) {
      return res.status(400).json({ error: 'Age when missing and estimated current age are required for age analysis' });
    }

    const analysis = await aiService.analyzeAge(caseDoc);

    caseDoc.aiAnalysis = caseDoc.aiAnalysis || {};
    caseDoc.aiAnalysis.ageProgression = analysis;
    caseDoc.aiAnalysis.lastAnalyzed = new Date();
    await caseDoc.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'AI_AGE_ANALYSIS',
      caseId: caseDoc.caseId,
      targetType: 'case',
      ipAddress: req.ip
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Age analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// POST /api/ai/cases/:id/risk-analysis
router.post('/cases/:id/risk-analysis', auth, requireRole('investigator', 'admin', 'family'), async (req, res) => {
  try {
    const caseDoc = await MissingCase.findOne({ caseId: req.params.id });
    if (!caseDoc) return res.status(404).json({ error: 'Case not found' });

    const analysis = await aiService.analyzeRisk(caseDoc);

    caseDoc.riskLevel = analysis.riskLevel;
    caseDoc.riskFactors = analysis.factors;
    caseDoc.aiAnalysis = caseDoc.aiAnalysis || {};
    caseDoc.aiAnalysis.riskAssessment = analysis;
    await caseDoc.save();

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'AI_RISK_ANALYSIS',
      caseId: caseDoc.caseId,
      targetType: 'case',
      ipAddress: req.ip
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Risk analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// POST /api/ai/sightings/:id/analyze
router.post('/sightings/:id/analyze', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const sighting = await Sighting.findOne({ sightingId: req.params.id });
    if (!sighting) return res.status(404).json({ error: 'Sighting not found' });

    // Get all active cases for comparison
    const cases = await MissingCase.find({ status: { $in: ['active', 'under_investigation'] } });

    const analysis = await aiService.analyzeSighting(sighting, cases);

    // Save analysis to sighting
    sighting.aiAnalysis = analysis;
    await sighting.save();

    // Create match leads for potential matches
    if (analysis.relatedCases?.length > 0) {
      for (const match of analysis.relatedCases) {
        const existingLead = await MatchLead.findOne({
          caseId: match.caseId,
          sightingId: sighting.sightingId
        });

        if (!existingLead) {
          await MatchLead.create({
            leadId: generateLeadId(),
            caseId: match.caseId,
            sightingId: sighting.sightingId,
            supportingFactors: match.supportingFactors,
            contradictingFactors: match.contradictingFactors,
            sourceEvidence: match.sourceReferences || [],
            confidence: analysis.confidence || 'LOW',
            confidenceScore: match.relevanceScore || 0,
            status: 'POTENTIAL_LEAD',
            identityConfirmed: false,
            missingInformation: analysis.missingInformation || [],
            nextAction: 'Authorized investigator review required'
          });
        }
      }
    }

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'AI_SIGHTING_ANALYSIS',
      targetType: 'sighting',
      targetId: sighting.sightingId,
      ipAddress: req.ip
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Sighting analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// POST /api/ai/clusters/analyze
router.post('/clusters/analyze', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const cases = await MissingCase.find({ status: { $in: ['active', 'under_investigation'] } });
    const sightings = await Sighting.find({ reviewStatus: { $ne: 'rejected' } });

    const analysis = await aiService.analyzeClusters(cases, sightings);

    // Create or update clusters
    if (analysis.clusters?.length > 0) {
      for (const cluster of analysis.clusters) {
        const clusterId = `CL-${Date.now().toString(36).toUpperCase().slice(-4)}`;
        await CaseCluster.create({
          clusterId,
          title: cluster.title,
          caseIds: cluster.caseIds,
          relationshipType: cluster.type,
          similarityScore: cluster.similarityScore,
          sharedAttributes: cluster.sharedAttributes,
          explanation: cluster.explanation,
          supportingEvidence: cluster.supportingEvidence,
          contradictingEvidence: cluster.contradictingEvidence,
          reviewStatus: 'pending'
        });
      }
    }

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'AI_CLUSTER_ANALYSIS',
      targetType: 'cluster',
      ipAddress: req.ip
    });

    res.json({ analysis });
  } catch (error) {
    console.error('Cluster analysis error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

// POST /api/ai/search
router.post('/search', auth, async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) return res.status(400).json({ error: 'Search query is required' });

    const aiResult = await aiService.analyzeSearch(query);

    // Perform actual search
    const cases = await MissingCase.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { caseId: { $regex: query, $options: 'i' } },
        { 'lastKnownLocation.city': { $regex: query, $options: 'i' } },
        { circumstances: { $regex: query, $options: 'i' } },
        { clothing: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    const sightings = await Sighting.find({
      $or: [
        { description: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } },
        { clothing: { $regex: query, $options: 'i' } }
      ]
    }).limit(20);

    res.json({ aiAnalysis: aiResult, cases, sightings });
  } catch (error) {
    console.error('AI search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

module.exports = router;
