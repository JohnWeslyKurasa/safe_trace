const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

const allowedMimeTypes = [
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a', 'audio/m4a',
  'video/mp4', 'video/quicktime'
];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported. Allowed: JPG, PNG, WEBP, PDF, TXT, DOCX, MP3, WAV, M4A, MP4, MOV`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 52428800 // 50MB
  }
});

const getFileType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('audio/')) return 'audio';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype === 'application/pdf' || mimetype.includes('document') || mimetype === 'text/plain') return 'document';
  return 'text';
};

const calculateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', data => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

module.exports = { upload, getFileType, calculateFileHash };
