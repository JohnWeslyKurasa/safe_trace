const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    if (user.verificationStatus === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
        req.userId = user._id;
      }
    }
  } catch (e) {
    // Optional auth - continue without user
  }
  next();
};

const auditAction = (action, targetType) => {
  return async (req, res, next) => {
    const originalSend = res.json;
    res.json = function(data) {
      if (res.statusCode < 400) {
        AuditLog.create({
          userId: req.userId,
          userName: req.user?.name,
          action,
          caseId: req.params.id || req.body?.caseId,
          evidenceId: req.params.evidenceId || req.body?.evidenceId,
          targetType,
          targetId: req.params.id,
          description: `${action} on ${targetType}`,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }).catch(err => console.error('Audit log error:', err));
      }
      originalSend.call(this, data);
    };
    next();
  };
};

module.exports = { auth, requireRole, optionalAuth, auditAction };
