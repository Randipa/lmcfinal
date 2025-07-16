const multer = require('multer');
const path = require('path');
const fs = require('fs');

const defaultDir = path.join(__dirname, '..', 'uploads', 'library');
const fallbackDir = '/tmp/uploads/library';

let uploadDir = process.env.UPLOAD_DIR
  ? path.join(process.env.UPLOAD_DIR, 'library')
  : defaultDir;

if (process.env.VERCEL && !process.env.UPLOAD_DIR) {
  uploadDir = fallbackDir;
}

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
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

module.exports = multer({ storage });
