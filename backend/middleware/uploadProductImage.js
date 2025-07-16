const multer = require('multer');
const path = require('path');
const fs = require('fs');

const defaultDir = path.join(__dirname, '..', 'uploads', 'products');
const fallbackDir = '/tmp/uploads/products';

let uploadDir = process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, 'products') : defaultDir;
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

const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter });
