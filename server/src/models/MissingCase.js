const mongoose = require('mongoose');

const missingCaseSchema = new mongoose.Schema({
  caseId: { type: String, required: true, unique: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  ageWhenMissing: { type: Number },
  estimatedCurrentAge: { type: Number },
  dateMissing: { type: Date },
  lastKnownLocation: {
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  physicalDescription: {
    height: String,
    weight: String,
    hairColor: String,
    eyeColor: String,
    distinguishingFeatures: String,
    additionalDetails: String
  },
  clothing: { type: String },
  circumstances: { type: String },
  photos: [{
    url: String,
    fileName: String,
    uploadedAt: { type: Date, default: Date.now },
    visibility: { type: String, enum: ['public', 'authorized', 'private'], default: 'authorized' }
  }],
  priority: {
    type: String,
    enum: ['normal', 'high', 'critical'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['active', 'under_investigation', 'resolved', 'closed'],
    default: 'active'
  },
  riskLevel: {
    type: String,
    enum: ['NORMAL', 'HIGH', 'CRITICAL'],
    default: 'NORMAL'
  },
  riskFactors: [String],
  visibilitySettings: {
    publicVisible: { type: Boolean, default: true },
    photoVisible: { type: Boolean, default: true },
    locationVisible: { type: Boolean, default: false },
    contactVisible: { type: Boolean, default: false }
  },
  consentSettings: {
    publicSearch: { type: Boolean, default: true },
    mediaSharing: { type: Boolean, default: false },
    reunificationConsent: { type: Boolean, default: false },
    secureCommunication: { type: Boolean, default: true }
  },
  contactInfo: {
    primaryContact: String,
    phone: String,
    email: String,
    relationship: String
  },
  aiAnalysis: {
    lastAnalyzed: Date,
    ageProgression: Object,
    riskAssessment: Object,
    extractedFacts: [Object]
  },
  timeline: [{
    date: Date,
    event: String,
    source: String,
    evidenceId: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

missingCaseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

missingCaseSchema.index({ 'lastKnownLocation.city': 1 });
missingCaseSchema.index({ status: 1, priority: 1 });
missingCaseSchema.index({ dateMissing: 1 });
missingCaseSchema.index({ name: 'text', 'physicalDescription.additionalDetails': 'text', circumstances: 'text' });

module.exports = mongoose.model('MissingCase', missingCaseSchema);
