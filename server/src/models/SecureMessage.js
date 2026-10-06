const mongoose = require('mongoose');

const secureMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caseId: { type: String },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'notification', 'system'], default: 'text' },
  readAt: Date,
  createdAt: { type: Date, default: Date.now }
});

secureMessageSchema.index({ senderId: 1, receiverId: 1 });
secureMessageSchema.index({ caseId: 1 });

module.exports = mongoose.model('SecureMessage', secureMessageSchema);
