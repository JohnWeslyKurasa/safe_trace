const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { validate, schemas } = require('../middleware/validate');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Generate unique case-style IDs
const generateId = (prefix) => `${prefix}-${Date.now().toString(36).toUpperCase()}`;

// POST /api/auth/register
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const { name, mobileNumber, email, password, role, consentGiven } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ mobileNumber }, { email }] });
    if (existingUser) {
      return res.status(409).json({ error: 'A user with this mobile number or email already exists' });
    }

    const user = new User({
      name,
      mobileNumber,
      email,
      passwordHash: password,
      role: role || 'public',
      consentGiven,
      verificationStatus: 'pending'
    });

    await user.save();

    await AuditLog.create({
      userId: user._id,
      userName: name,
      action: 'USER_REGISTERED',
      description: `New user registered: ${name} (${role || 'public'})`,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.status(201).json({
      message: 'Registration successful. Please verify your mobile number with OTP.',
      userId: user._id,
      mobileNumber: user.mobileNumber
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/request-otp
router.post('/request-otp', validate(schemas.requestOtp), async (req, res) => {
  try {
    const { mobileNumber } = req.body;
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this mobile number' });
    }

    // Rate limit: max 1 OTP per 60 seconds
    if (user.otpLastRequest && (Date.now() - user.otpLastRequest) < 60000) {
      const waitSeconds = Math.ceil((60000 - (Date.now() - user.otpLastRequest)) / 1000);
      return res.status(429).json({ error: `Please wait ${waitSeconds} seconds before requesting a new OTP` });
    }

    let otp;
    if (process.env.MOCK_OTP_MODE === 'true') {
      otp = process.env.MOCK_OTP_CODE || '123456';
    } else {
      otp = crypto.randomInt(100000, 999999).toString();
      // In production: send SMS via Twilio/SNS etc.
    }

    const otpHash = await bcrypt.hash(otp, 10);
    user.otpHash = otpHash;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.otpAttempts = 0;
    user.otpLastRequest = new Date();
    await user.save();

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      action: 'OTP_REQUESTED',
      description: 'OTP verification requested',
      ipAddress: req.ip
    });

    const response = { message: 'OTP sent successfully', expiresIn: 600 };
    if (process.env.MOCK_OTP_MODE === 'true') {
      response.mockOtp = otp;
      response.notice = 'Mock mode enabled - OTP displayed for development only';
    }

    res.json(response);
  } catch (error) {
    console.error('OTP request error:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', validate(schemas.verifyOtp), async (req, res) => {
  try {
    const { mobileNumber, email, otp } = req.body;
    const user = await User.findOne(
      mobileNumber ? { mobileNumber } : { email }
    );
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check attempts
    if (user.otpAttempts >= 5) {
      return res.status(429).json({ error: 'Too many OTP attempts. Please request a new OTP.' });
    }

    // Check expiry
    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.otpHash);
    if (!isValid) {
      user.otpAttempts += 1;
      await user.save();
      return res.status(400).json({
        error: 'Invalid OTP',
        attemptsRemaining: 5 - user.otpAttempts
      });
    }

    // Mark verified
    user.verificationStatus = 'verified';
    user.otpHash = undefined;
    user.otpExpiry = undefined;
    user.otpAttempts = 0;
    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      action: 'OTP_VERIFIED',
      description: 'Mobile number verified via OTP',
      ipAddress: req.ip
    });

    res.json({
      message: 'Verification successful',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// POST /api/auth/login
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const lookupValue = identifier || email;

    const user = await User.findOne({
      $or: [{ mobileNumber: lookupValue }, { email: lookupValue }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.verificationStatus === 'suspended') {
      return res.status(403).json({ error: 'Account is suspended' });
    }

    // Add device session
    const session = {
      deviceId: crypto.randomBytes(16).toString('hex'),
      userAgent: req.get('user-agent'),
      ip: req.ip,
      loginAt: new Date(),
      lastActive: new Date()
    };
    user.deviceSessions.push(session);
    if (user.deviceSessions.length > 5) {
      user.deviceSessions = user.deviceSessions.slice(-5);
    }
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, deviceId: session.deviceId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    await AuditLog.create({
      userId: user._id,
      userName: user.name,
      action: 'USER_LOGIN',
      description: 'User logged in',
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    res.json({
      message: 'Login successful',
      token,
      user: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', auth, async (req, res) => {
  try {
    await AuditLog.create({
      userId: req.userId,
      userName: req.user.name,
      action: 'USER_LOGOUT',
      description: 'User logged out',
      ipAddress: req.ip
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
});

module.exports = router;
