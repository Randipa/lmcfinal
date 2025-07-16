const BankPaymentRequest = require('../models/BankPaymentRequest');
const UserCourseAccess = require('../models/UserCourseAccess');
const User = require('../models/User');
const Course = require('../models/Course');
const sendWhatsapp = require('../utils/sendWhatsappMessage');
const notifyAdmins = require('../utils/notifyAdmins');

exports.submitBankPayment = async (req, res) => {
  const { courseId } = req.body;
  const userId = req.user.userId;
  const baseUrl =
    process.env.BASE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : `${req.protocol}://${req.get('host')}`);
  const slipUrl = req.file
    ? `${baseUrl}/uploads/bank-slips/${req.file.filename}`
    : req.body.slipUrl;

  const existing = await UserCourseAccess.findOne({
    userId,
    courseId,
    expiresAt: { $gt: new Date() }
  });
  if (existing) return res.status(400).json({ message: 'You already have access to this course until the 8th.' });

  if (!slipUrl) {
    return res.status(400).json({ message: 'Slip file is required' });
  }

  const request = new BankPaymentRequest({ userId, courseId, slipUrl });
  await request.save();

  try {
    const user = await User.findById(userId);
    const course = await Course.findById(courseId);
    if (user && course) {
      const msg = `${user.firstName} ${user.lastName} submitted a bank payment for ${course.title}.`;
      await notifyAdmins(msg);
    }
  } catch (e) {
    console.error('WhatsApp notify error:', e.message);
  }
  res.status(201).json({ message: 'Bank payment submitted', request });
};

exports.approveBankPayment = async (req, res) => {
  const { requestId } = req.params;
  const request = await BankPaymentRequest.findById(requestId);
  if (!request || request.status !== 'pending') return res.status(404).json({ message: 'Request not found' });

  request.status = 'approved';
  await request.save();

  await UserCourseAccess.create({ userId: request.userId, courseId: request.courseId });

  try {
    const user = await User.findById(request.userId);
    const course = await Course.findById(request.courseId);
    if (user && course) {
      const msg = `Your payment for ${course.title} has been approved.`;
      await sendWhatsapp(user.phoneNumber, msg);
    }
  } catch (e) {
    console.error('WhatsApp notify error:', e.message);
  }
  res.json({ message: 'Payment approved and access granted' });
};

// Fetch bank payment requests (admin)
exports.getBankPaymentRequests = async (req, res) => {
  const status = req.query.status || 'pending';
  const requests = await BankPaymentRequest.find({ status })
    .populate('userId', 'firstName lastName')
    .populate('courseId', 'title');
  res.json({ requests });
};

// Fetch current user's bank payment requests
exports.getMyBankPayments = async (req, res) => {
  const userId = req.user.userId;
  const requests = await BankPaymentRequest.find({ userId })
    .populate('courseId', 'title')
    .sort({ createdAt: -1 });
  res.json({ requests });
};

// Download bank slip file (admin)
exports.downloadBankSlip = async (req, res) => {
  const { requestId } = req.params;
  const request = await BankPaymentRequest.findById(requestId);
  if (!request || !request.slipUrl) {
    return res.status(404).json({ message: 'Slip not found' });
  }

  const fs = require('fs');
  const path = require('path');

  const fileName = path.basename(request.slipUrl);
  const defaultDir = path.join(__dirname, '..', 'uploads', 'bank-slips');
  const fallbackDir = '/tmp/uploads/bank-slips';

  const dirs = [
    process.env.UPLOAD_DIR ? path.join(process.env.UPLOAD_DIR, 'bank-slips') : defaultDir,
    defaultDir,
    fallbackDir
  ];

  let filePath = '';
  for (const dir of dirs) {
    const potential = path.join(dir, fileName);
    if (fs.existsSync(potential)) {
      filePath = potential;
      break;
    }
  }

  if (!filePath) {
    return res.status(404).json({ message: 'File not found' });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error('Download error:', err);
      res.status(500).json({ message: 'Could not download file' });
    }
  });
};

