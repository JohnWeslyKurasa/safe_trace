const mongoose = require('mongoose');

const caseClusterSchema = new mongoose.Schema({
  clusterId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  caseIds: [String],
  evidenceIds: [String],
  sightingIds: [String],
  sharedAttributes: [{
    attribute: String,
    value: String,
    matchCount: Number
  }],
  relationshipType: {
    type: String,
    enum: [
      'POSSIBLE_DUPLICATE', 'POSSIBLE_RELATED_CASE', 'RELATED_SIGHTING',
      'GEOGRAPHIC_PATTERN', 'TEMPORAL_PATTERN', 'SHARED_ATTRIBUTES', 'UNRELATED_AFTER_REVIEW'
    ],
    required: true
  },
  similarityScore: { type: Number, min: 0, max: 1 },
  explanation: String,
  supportingEvidence: [String],
  contradictingEvidence: [String],
  reviewStatus: {
    type: String,
    enum: ['pending', 'under_review', 'confirmed', 'rejected'],
    default: 'pending'
  },
  reviewNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CaseCluster', caseClusterSchema);
