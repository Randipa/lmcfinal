const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Directory for subtitle uploads. Serverless environments use a read-only
// filesystem for the application code, so default to the system temp directory
// when running on Vercel. This can also be overridden with UPLOAD_DIR.
const defaultDir = path.join(__dirname, '..', 'uploads', 'subtitles');
const fallbackDir = '/tmp/uploads/subtitles';

let uploadDir = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, 'subtitles')
  : defaultDir;

if (process.env.VERCEL && !process.env.UPLOAD_DIR) {
  uploadDir = fallbackDir;
}

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  // Fallback to /tmp when directory creation fails.
  uploadDir = fallbackDir;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${file.originalname}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.srt', '.vtt'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter });
