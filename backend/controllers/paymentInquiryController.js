const PaymentInquiry = require('../models/PaymentInquiry');
const User = require('../models/User');
const Course = require('../models/Course');
const sendWhatsapp = require('../utils/sendWhatsappMessage');
const notifyAdmins = require('../utils/notifyAdmins');

exports.createInquiry = async (req, res) => {
  try {
    const { courseId, firstName, lastName, phoneNumber, message } = req.body;
    const userId = req.user?.userId;
    if (!courseId) {
      return res.status(400).json({ message: 'Course id required' });
    }

    const search = userId
      ? { userId, courseId }
      : { phoneNumber, courseId };
    const existing = await PaymentInquiry.findOne({
      ...search,
      status: { $in: ['pending', 'approved'] }
    });

    if (existing) {
      return res.status(400).json({ message: 'Inquiry already submitted' });
    }

    let inquiryData = { courseId, message };
    if (userId) {
      const user = await User.findById(userId);
      inquiryData = {
        ...inquiryData,
        userId,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber
      };
    } else {
      if (!firstName || !lastName || !phoneNumber) {
        return res
          .status(400)
          .json({ message: 'Name and phone number required' });
      }
      inquiryData = {
        ...inquiryData,
        firstName,
        lastName,
        phoneNumber
      };
    }

    const inquiry = await PaymentInquiry.create(inquiryData);

    try {
      const course = await Course.findById(courseId);
      if (course) {
        const name = inquiryData.firstName + ' ' + inquiryData.lastName;
        const msg = `${name} submitted an inquiry for ${course.title}`;
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

// Get single inquiry (Admin only)
exports.getInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await PaymentInquiry.findById(id)
      .populate('userId', 'firstName lastName phoneNumber')
      .populate('courseId', 'title price');
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ inquiry });
  } catch (err) {
    console.error('Get inquiry error:', err);
    res.status(500).json({ message: 'Failed to fetch inquiry' });
  }
};

exports.approveInquiry = async (req, res) => {
  try {
    const { id } = req.params;
  const inquiry = await PaymentInquiry.findById(id);
  if (!inquiry) return res.status(404).json({ message: 'Inquiry not found' });

  // create user automatically if not already registered
  let user = null;
  if (inquiry.userId) {
    user = await User.findById(inquiry.userId);
  } else {
    user = await User.findOne({ phoneNumber: inquiry.phoneNumber });
    if (!user) {
      user = new User({
        firstName: inquiry.firstName || 'Student',
        lastName: inquiry.lastName || '',
        phoneNumber: inquiry.phoneNumber,
        password: inquiry.phoneNumber,
        education: 'N/A',
        address: 'N/A'
      });
      await user.save();
    }
    inquiry.userId = user._id;
  }

  inquiry.status = 'approved';
  await inquiry.save();

  try {
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
