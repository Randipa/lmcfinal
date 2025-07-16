const multer = require('multer');
const path = require('path');
const fs = require('fs');

const defaultDir = path.join(__dirname, '..', 'uploads', 'submissions');
const fallbackDir = '/tmp/uploads/submissions';

let uploadDir = process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, 'submissions') : defaultDir;

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
    const assignmentId = req.params.assignmentId || 'assignment';
    const studentId = req.user ? req.user.userId : 'student';
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${assignmentId}-${studentId}-${Date.now()}${ext}`;
    cb(null, unique);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['.pdf', '.doc', '.docx', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();
  cb(null, allowed.includes(ext));
};

module.exports = multer({ storage, fileFilter });
