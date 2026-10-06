const mongoose = require('mongoose');

const matchLeadSchema = new mongoose.Schema({
  leadId: { type: String, required: true, unique: true },
  caseId: { type: String, required: true },
  sightingId: String,
  evidenceIds: [String],
  supportingFactors: [String],
  contradictingFactors: [String],
  sourceEvidence: [{
    evidenceId: String,
    source: String,
    timestamp: String,
    description: String
  }],
  confidence: {
    type: String,
    enum: ['LOW', 'MODERATE', 'HIGH'],
    default: 'LOW'
  },
  confidenceScore: { type: Number, min: 0, max: 1 },
  status: {
    type: String,
    enum: ['POTENTIAL_LEAD', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_MORE_INFO'],
    default: 'POTENTIAL_LEAD'
  },
  humanReview: {
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: Date,
    action: String,
    notes: String,
    previousStatus: String,
    newStatus: String,
    evidenceUsed: [String]
  },
  identityConfirmed: { type: Boolean, default: false },
  missingInformation: [String],
  nextAction: String,
  createdAt: { type: Date, default: Date.now }
});

matchLeadSchema.index({ caseId: 1 });
matchLeadSchema.index({ status: 1 });

module.exports = mongoose.model('MatchLead', matchLeadSchema);
