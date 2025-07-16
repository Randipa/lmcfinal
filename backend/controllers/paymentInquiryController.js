const PaymentInquiry = require('../models/PaymentInquiry');
const User = require('../models/User');
const Course = require('../models/Course');
const sendWhatsapp = require('../utils/sendWhatsappMessage');
const notifyAdmins = require('../utils/notifyAdmins');

exports.createInquiry = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.userId;
    if (!courseId) {
      return res.status(400).json({ message: 'Course id required' });
    }

    const existing = await PaymentInquiry.findOne({
      userId,
      courseId,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'Inquiry already submitted' });
    }

    const inquiry = await PaymentInquiry.create({ userId, courseId });

    try {
      const user = await User.findById(userId);
      const course = await Course.findById(courseId);
      if (user && course) {
        const msg = `${user.firstName} ${user.lastName} submitted an inquiry for ${course.title}`;
        await notifyAdmins(msg);
      }
    } catch (e) {
      console.error('WhatsApp notify error:', e.message);
    }

    res.status(201).json({ message: 'Inquiry submitted', inquiry });
  } catch (err) {
    console.error('Create inquiry error:', err);
    res.status(500).json({ message: 'Failed to submit inquiry' });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const userId = req.user.userId;
    const inquiries = await PaymentInquiry.find({ userId })
      .populate('courseId', 'title price description');
    res.json({ inquiries });
  } catch (err) {
    console.error('Get my inquiries error:', err);
    res.status(500).json({ message: 'Failed to fetch inquiries' });
  }
};

exports.getInquiries = async (req, res) => {
  try {
    const status = req.query.status;
    const query = status ? { status } : {};
    const inquiries = await PaymentInquiry.find(query)
      .populate('userId', 'firstName lastName')
      .populate('courseId', 'title');
    res.json({ inquiries });
  } catch (err) {
    console.error('Get inquiries error:', err);
    res.status(500).json({ message: 'Failed to fetch inquiries' });
  }
};

exports.approveInquiry = async (req, res) => {
  try {
    const { id } = req.params;
  const inquiry = await PaymentInquiry.findById(id);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  inquiry.status = 'approved';
  await inquiry.save();

  try {
    const user = await User.findById(inquiry.userId);
    const course = await Course.findById(inquiry.courseId);
    if (user && course) {
      const msg = `Your payment inquiry for ${course.title} has been approved.`;
      await sendWhatsapp(user.phoneNumber, msg);
    }
  } catch (e) {
    console.error('WhatsApp notify error:', e.message);
  }

  res.json({ message: 'Inquiry approved' });
  } catch (err) {
    console.error('Approve inquiry error:', err);
    res.status(500).json({ message: 'Failed to approve inquiry' });
  }
};

exports.markPaid = async (userId, courseId) => {
  try {
    await PaymentInquiry.findOneAndUpdate(
      { userId, courseId, status: 'approved' },
      { status: 'paid' }
    );
  } catch (err) {
    console.error('Mark paid error:', err);
  }
};
