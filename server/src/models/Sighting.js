const mongoose = require('mongoose');

const sightingSchema = new mongoose.Schema({
  sightingId: { type: String, required: true, unique: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: { lat: Number, lng: Number }
  },
  date: { type: Date },
  approximateTime: { type: String },
  description: { type: String },
  clothing: { type: String },
  approximateAge: { type: Number },
  witnessNotes: { type: String },
  photoEvidenceId: { type: String },
  videoEvidenceId: { type: String },
  audioEvidenceId: { type: String },
  attachedEvidenceIds: [String],
  relatedCaseIds: [String],
  aiAnalysis: {
    potentialMatches: [{
      caseId: String,
      relevanceScore: Number,
      supportingFactors: [String],
      contradictingFactors: [String],
      sourceReferences: [Object]
    }],
    extractedFacts: [Object],
    confidence: String,
    missingInformation: [String],
    nextAction: String
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'under_review', 'verified', 'rejected', 'needs_more_info'],
    default: 'pending'
  },
  reviewNotes: String,
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: Date,
  consentConfirmed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

sightingSchema.index({ 'location.city': 1 });
sightingSchema.index({ date: 1 });
sightingSchema.index({ reviewStatus: 1 });

module.exports = mongoose.model('Sighting', sightingSchema);
