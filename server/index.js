require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./src/config/db');
const { initGemini } = require('./src/services/aiService');

const app = express();

// Connect to MongoDB
connectDB();

// Initialize AI
initGemini();

// Security middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many authentication attempts, please try again later' }
});
app.use('/api/auth/', authLimiter);

// Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/cases', require('./src/routes/cases'));
app.use('/api/evidence', require('./src/routes/evidence'));
app.use('/api/sightings', require('./src/routes/sightings'));
app.use('/api/ai', require('./src/routes/ai'));
app.use('/api', require('./src/routes/investigation'));
app.use('/api', require('./src/routes/platform'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    name: 'SafeTrace API',
    version: '1.0.0',
    aiMode: process.env.GEMINI_API_KEY ? 'gemini' : 'mock',
    otpMode: process.env.MOCK_OTP_MODE === 'true' ? 'mock' : 'production',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);

  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size exceeds the maximum limit (50MB)' });
    }
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }

  if (err.message && err.message.includes('File type')) {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🛡️  SafeTrace API Server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   AI Mode: ${process.env.GEMINI_API_KEY ? 'Gemini' : 'Mock'}`);
  console.log(`   OTP Mode: ${process.env.MOCK_OTP_MODE === 'true' ? 'Mock (Dev)' : 'Production'}`);
  console.log(`   Client URL: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});

module.exports = app;
