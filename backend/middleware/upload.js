const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory where temporary uploads will be stored before being sent to
// Bunny.net. In serverless environments like Vercel the application files
// are read-only, so we fall back to the system temp directory which is
// writable. Allow overriding via the UPLOAD_DIR environment variable.
const defaultDir = path.join(__dirname, '..', 'uploads');
const fallbackDir = '/tmp/uploads';

let uploadDir = process.env.UPLOAD_DIR || defaultDir;

if (process.env.VERCEL && !process.env.UPLOAD_DIR) {
  uploadDir = fallbackDir;
}

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  // In read-only environments the above may fail. Fallback to /tmp.
  uploadDir = fallbackDir;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.mp4', '.mov', '.avi'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter });
