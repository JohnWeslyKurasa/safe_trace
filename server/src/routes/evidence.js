const express = require('express');
const fs = require('fs');
const Evidence = require('../models/Evidence');
const MissingCase = require('../models/MissingCase');
const AuditLog = require('../models/AuditLog');
const { auth, requireRole } = require('../middleware/auth');
const { upload, getFileType, calculateFileHash } = require('../middleware/upload');
const aiService = require('../services/aiService');

const router = express.Router();

const generateEvidenceId = () => `EV-${Date.now().toString(36).toUpperCase().slice(-4)}${Math.random().toString(36).slice(2, 4).toUpperCase()}`;

// POST /api/evidence/upload
router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { caseId } = req.body;
    if (!caseId) {
      return res.status(400).json({ error: 'Case ID is required' });
    }

    // Verify case exists
    const caseDoc = await MissingCase.findOne({ caseId });
    if (!caseDoc) {
      return res.status(404).json({ error: 'Case not found' });
    }

    // Calculate file hash for duplicate detection
    const fileHash = await calculateFileHash(req.file.path);

    // Check for duplicates
    const existingEvidence = await Evidence.findOne({ fileHash, caseId });
    if (existingEvidence) {
      // Clean up uploaded duplicate
      fs.unlinkSync(req.file.path);
      return res.status(409).json({
        error: 'This file has already been uploaded for this case',
        existingEvidenceId: existingEvidence.evidenceId
      });
    }

    const fileType = getFileType(req.file.mimetype);
    const evidence = new Evidence({
      evidenceId: generateEvidenceId(),
      caseId,
      uploadedBy: req.userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileType,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileHash,
      storagePath: req.file.path,
      processingStatus: 'pending'
    });

    await evidence.save();

    // Add to case photos if image
    if (fileType === 'image') {
      caseDoc.photos.push({
        url: `/api/evidence/${evidence.evidenceId}/file`,
        fileName: req.file.originalname,
        uploadedAt: new Date()
      });
      await caseDoc.save();
    }

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'EVIDENCE_UPLOADED',
      caseId,
      evidenceId: evidence.evidenceId,
      targetType: 'evidence',
      targetId: evidence.evidenceId,
      description: `Evidence uploaded: ${req.file.originalname} (${fileType})`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Evidence uploaded successfully',
      evidence: {
        evidenceId: evidence.evidenceId,
        fileName: evidence.originalName,
        fileType: evidence.fileType,
        fileSize: evidence.fileSize,
        processingStatus: evidence.processingStatus
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload evidence' });
  }
});

// GET /api/evidence/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id })
      .populate('uploadedBy', 'name')
      .populate('reviewedBy', 'name');

    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    res.json({ evidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// GET /api/evidence/:id/file - Serve the actual file
router.get('/:id/file', auth, async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id });
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    if (evidence.storagePath && fs.existsSync(evidence.storagePath)) {
      res.setHeader('Content-Type', evidence.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `inline; filename="${evidence.originalName || evidence.fileName}"`);
      return res.sendFile(require('path').resolve(evidence.storagePath));
    }

    res.status(404).json({ error: 'File not found on disk' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to serve file' });
  }
});

// GET /api/evidence/case/:caseId - Get all evidence for a case
router.get('/case/:caseId', auth, async (req, res) => {
  try {
    const evidence = await Evidence.find({ caseId: req.params.caseId })
      .populate('uploadedBy', 'name')
      .sort('-createdAt');

    res.json({ evidence });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch evidence' });
  }
});

// POST /api/evidence/:id/process - Process evidence with AI
router.post('/:id/process', auth, requireRole('investigator', 'admin', 'family'), async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id });
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    evidence.processingStatus = 'processing';
    await evidence.save();

    // Read file for AI if available
    let fileBuffer = null;
    if (evidence.storagePath && fs.existsSync(evidence.storagePath)) {
      fileBuffer = fs.readFileSync(evidence.storagePath);
    }

    // Run AI analysis
    const analysis = await aiService.analyzeEvidence(evidence, fileBuffer);

    // Update evidence with results
    evidence.processingStatus = 'completed';
    evidence.extractedFacts = analysis.extractedFacts || [];
    evidence.transcript = analysis.transcript || evidence.transcript;
    evidence.extractedText = analysis.textDetected || evidence.extractedText;
    evidence.aiAnalysis = analysis;
    evidence.confidence = analysis.confidence || 0;

    if (analysis.keyframes) {
      evidence.metadata = evidence.metadata || {};
      evidence.metadata.keyframes = analysis.keyframes;
    }

    evidence.sourceReferences = analysis.sourceReferences || [];
    await evidence.save();

    // Update case timeline if facts extracted
    if (analysis.extractedFacts?.length > 0) {
      const caseDoc = await MissingCase.findOne({ caseId: evidence.caseId });
      if (caseDoc) {
        caseDoc.timeline.push({
          date: new Date(),
          event: `AI analysis completed for ${evidence.originalName || evidence.fileName}`,
          source: evidence.evidenceId,
          evidenceId: evidence.evidenceId,
          addedBy: req.userId
        });
        await caseDoc.save();
      }
    }

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'EVIDENCE_PROCESSED',
      caseId: evidence.caseId,
      evidenceId: evidence.evidenceId,
      targetType: 'evidence',
      targetId: evidence.evidenceId,
      description: `AI analysis completed for ${evidence.originalName}`,
      ipAddress: req.ip
    });

    res.json({
      message: 'Evidence processed successfully',
      analysis,
      evidence: {
        evidenceId: evidence.evidenceId,
        processingStatus: evidence.processingStatus,
        extractedFacts: evidence.extractedFacts,
        confidence: evidence.confidence
      }
    });
  } catch (error) {
    console.error('Process evidence error:', error);

    // Mark as failed
    await Evidence.findOneAndUpdate(
      { evidenceId: req.params.id },
      { processingStatus: 'failed' }
    );

    res.status(500).json({ error: 'Failed to process evidence' });
  }
});

// DELETE /api/evidence/:id
router.delete('/:id', auth, requireRole('investigator', 'admin'), async (req, res) => {
  try {
    const evidence = await Evidence.findOne({ evidenceId: req.params.id });
    if (!evidence) {
      return res.status(404).json({ error: 'Evidence not found' });
    }

    // Delete file from disk
    if (evidence.storagePath && fs.existsSync(evidence.storagePath)) {
      fs.unlinkSync(evidence.storagePath);
    }

    await Evidence.deleteOne({ evidenceId: req.params.id });

    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'EVIDENCE_DELETED',
      caseId: evidence.caseId,
      evidenceId: evidence.evidenceId,
      targetType: 'evidence',
      ipAddress: req.ip
    });

    res.json({ message: 'Evidence deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete evidence' });
  }
});

module.exports = router;
