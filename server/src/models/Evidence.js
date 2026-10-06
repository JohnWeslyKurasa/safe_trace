const mongoose = require('mongoose');

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true },
  caseId: { type: String, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: { type: String, required: true },
  originalName: { type: String },
  fileType: {
    type: String,
    enum: ['image', 'document', 'audio', 'video', 'text'],
    required: true
  },
  mimeType: String,
  fileSize: Number,
  fileHash: String,
  storagePath: String,
  transcript: String,
  extractedText: String,
  extractedFacts: [{
    fact: String,
    category: { type: String, enum: ['person', 'location', 'time', 'clothing', 'object', 'event', 'description', 'other'] },
    confidence: Number,
    sourceReference: {
      page: Number,
      timestamp: String,
      section: String
    }
  }],
  metadata: {
    duration: Number,
    dimensions: { width: Number, height: Number },
    pageCount: Number,
    codec: String,
    bitrate: Number,
    createdDate: Date,
    location: Object,
    keyframes: [{
      timestamp: String,
      description: String,
      objects: [String]
    }]
  },
  sourceReferences: [{
    evidenceId: String,
    source: String,
    timestamp: String,
    page: Number,
    section: String,
    description: String
  }],
  confidence: { type: Number, default: 0, min: 0, max: 1 },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  reviewStatus: {
    type: String,
    enum: ['unreviewed', 'reviewed', 'approved', 'rejected', 'needs_more_info'],
    default: 'unreviewed'
  },
  reviewNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  aiAnalysis: Object,
  relatedSightings: [String],
  relatedCases: [String],
  createdAt: { type: Date, default: Date.now }
});

evidenceSchema.index({ caseId: 1 });
evidenceSchema.index({ fileHash: 1 });
evidenceSchema.index({ processingStatus: 1 });

module.exports = mongoose.model('Evidence', evidenceSchema);
