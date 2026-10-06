const mongoose = require('mongoose');

const patternAlertSchema = new mongoose.Schema({
  alertId: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: ['geographic_cluster', 'temporal_pattern', 'similar_descriptions', 'repeated_location', 'age_group_pattern'],
    required: true
  },
  title: String,
  relatedCaseIds: [String],
  relatedSightingIds: [String],
  relatedEvidenceIds: [String],
  locationSummary: String,
  timeSummary: String,
  explanation: String,
  confidence: { type: Number, min: 0, max: 1 },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  reviewStatus: {
    type: String,
    enum: ['pending', 'acknowledged', 'investigating', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reviewNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatternAlert', patternAlertSchema);
