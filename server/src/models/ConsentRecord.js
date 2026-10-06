const mongoose = require('mongoose');

const consentRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: String },
  consentType: {
    type: String,
    enum: ['public_visibility', 'photo_sharing', 'evidence_access', 'contact_sharing', 'location_sharing', 'secure_communication', 'reunification', 'data_processing'],
    required: true
  },
  granted: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  revokedAt: Date,
  metadata: Object
});

consentRecordSchema.index({ userId: 1, caseId: 1 });

module.exports = mongoose.model('ConsentRecord', consentRecordSchema);
