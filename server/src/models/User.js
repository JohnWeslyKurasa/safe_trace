const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  mobileNumber: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['public', 'family', 'investigator', 'organization', 'admin'],
    default: 'public'
  },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'suspended'],
    default: 'pending'
  },
  otpHash: String,
  otpExpiry: Date,
  otpAttempts: { type: Number, default: 0 },
  otpLastRequest: Date,
  deviceSessions: [{
    deviceId: String,
    userAgent: String,
    ip: String,
    loginAt: { type: Date, default: Date.now },
    lastActive: { type: Date, default: Date.now }
  }],
  consentGiven: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    verificationStatus: this.verificationStatus,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('User', userSchema);
