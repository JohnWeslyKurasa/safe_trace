const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: String,
  action: { type: String, required: true },
  caseId: String,
  evidenceId: String,
  targetType: String,
  targetId: String,
  description: String,
  metadata: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ userId: 1 });
auditLogSchema.index({ caseId: 1 });
auditLogSchema.index({ timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
