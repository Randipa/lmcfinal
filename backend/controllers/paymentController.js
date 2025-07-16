const User = require('../models/User');
const Payment = require('../models/Payment');
const UserCourseAccess = require('../models/UserCourseAccess');
const PaymentInquiry = require('../models/PaymentInquiry');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const crypto = require('crypto');
const Course = require('../models/Course');
const sendWhatsapp = require('../utils/sendWhatsappMessage');
const notifyAdmins = require('../utils/notifyAdmins');

// Helper: Normalize phone number
const normalizePhoneNumber = (phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');
  if (digits.length === 10 && digits.startsWith('07')) return digits;
  throw new Error('Invalid phone number format');
};

// Helper: Calculate expiry to next 8th
const getNext8th = () => {
  const today = new Date();
  const year = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();
  const month = today.getMonth() === 11 ? 0 : today.getMonth() + 1;
  return new Date(year, month, 8, 0, 0, 0);
};

// Generate PayHere hash
const generatePayHereHash = (merchantId, orderId, amount, currency, merchantSecret) => {
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const hashString = merchantId + orderId + formattedAmount + currency + hashedSecret;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

const generatePayHereVerificationHash = (merchantId, orderId, amount, currency, statusCode, merchantSecret) => {
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashedSecret = crypto.createHash('md5').update(merchantSecret).digest('hex').toUpperCase();
  const hashString = merchantId + orderId + formattedAmount + currency + statusCode + hashedSecret;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

// Initiate Payment
exports.initiatePayment = async (req, res) => {
  try {
    const { courseId, amount, phoneNumber } = req.body;
    const userId = req.user?.userId;
    if (!courseId || !amount || !phoneNumber || !userId) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const user = await User.findOne({ phoneNumber: normalizedPhone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const alreadyEnrolled = await UserCourseAccess.findOne({
      userId,
      courseId,
      expiresAt: { $gt: new Date() }
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ message: 'Already enrolled until next 8th.' });
    }

    const orderId = `ORD${Date.now()}`;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = 'LKR';
    const formattedAmount = parseFloat(amount).toFixed(2);
    const hash = generatePayHereHash(merchantId, orderId, formattedAmount, currency, merchantSecret);

    const payment = new Payment({
      userId,
      courseId,
      orderId,
      amount: formattedAmount,
      currency,
      phoneNumber: normalizedPhone,
      status: 'pending',
      paymentMethod: 'payhere',
      paymentData: { merchantId, hash, initiatedAt: new Date() }
    });

    await payment.save();

    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000');

    const paymentData = {
      sandbox: process.env.PAYHERE_SANDBOX === 'true',
      merchant_id: merchantId,
      return_url: `${baseUrl}/api/payment/return`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      notify_url: `${baseUrl}/api/payment/notify`,
      order_id: orderId,
      items: `Course Enrollment - ${courseId}`,
      amount: formattedAmount,
      currency,
      hash,
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email || `user${normalizedPhone}@example.com`,
      phone: normalizedPhone,
      address: user.address,
      city: user.city || 'Colombo',
      country: 'Sri Lanka',
      custom_1: userId,
      custom_2: courseId
    };

    res.json({ success: true, paymentData, orderId });
  } catch (error) {
    console.error('initiatePayment error:', error.message);
    res.status(500).json({ message: 'Payment initiation failed.' });
  }
};

// Handle PayHere Return
exports.handlePaymentReturn = async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) return res.redirect(`${process.env.FRONTEND_URL}/payment-error?error=no_order_id`);

    await Payment.findOneAndUpdate(
      { orderId: order_id },
      { $set: { 'paymentData.returnReceivedAt': new Date() } }
    );

    res.redirect(`${process.env.FRONTEND_URL}/payment-success?order=${order_id}`);
  } catch (error) {
    console.error('Return error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/payment-error?error=return_handler_failed`);
  }
};

// Handle Cancel
exports.handlePaymentCancel = async (req, res) => {
  try {
    const { order_id } = req.query;
    if (order_id) {
      await Payment.findOneAndUpdate({ orderId: order_id }, {
        status: 'cancelled',
        'paymentData.cancelledAt': new Date()
      });
    }
    res.redirect(`${process.env.FRONTEND_URL}/payment-cancelled?order=${order_id || 'unknown'}`);
  } catch (error) {
    console.error('Cancel error:', error.message);
    res.redirect(`${process.env.FRONTEND_URL}/payment-error?error=cancel_handler_failed`);
  }
};

// Handle Notify
exports.handlePaymentNotify = async (req, res) => {
  try {
    const {
      merchant_id, order_id, payment_id, payhere_amount,
      payhere_currency, status_code, md5sig,
      custom_1: userId, custom_2: courseId
    } = req.body;

    const authHeader = req.headers['authorization'];
    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.userRole === 'admin') {
          if (!order_id || !payment_id || !userId || !courseId) {
            return res.status(400).json({ message: 'Missing required fields' });
          }

          await Payment.findOneAndUpdate(
            { orderId: order_id },
            {
              paymentId: payment_id,
              status: 'completed',
              completedAt: new Date(),
              'paymentData.adminApprovedAt': new Date()
            }
          );

          await UserCourseAccess.create({
            userId,
            courseId,
            purchasedAt: new Date(),
            expiresAt: getNext8th()
          });

          try {
            const user = await User.findById(userId);
            const course = await Course.findById(courseId);
            if (user && course) {
              const msg = `Your payment for ${course.title} has been approved.`;
              await sendWhatsapp(user.phoneNumber, msg);
            }
          } catch (e) {
            console.error('WhatsApp notify error:', e.message);
          }

          return res.json({ message: 'Payment approved by admin' });
        }
      } catch (err) {
        console.error('Admin override failed:', err.message);
      }
    }

    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const validSig = generatePayHereVerificationHash(
      merchant_id, order_id, payhere_amount,
      payhere_currency, status_code, merchantSecret
    );

    if (validSig !== md5sig.toUpperCase()) {
      console.error('Invalid signature');
      return res.status(400).send('Invalid signature');
    }

    if (order_id.startsWith('SHOP')) {
      const ShopOrder = require('../models/ShopOrder');
      await ShopOrder.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentId: payment_id,
          status: status_code === '2' ? 'paid' : getPaymentStatus(status_code),
          updatedAt: new Date()
        }
      );
    } else {
      await Payment.findOneAndUpdate(
        { orderId: order_id },
        {
          paymentId: payment_id,
          status: status_code === '2' ? 'completed' : getPaymentStatus(status_code),
          completedAt: status_code === '2' ? new Date() : null,
          'paymentData.notifyReceivedAt': new Date()
        }
      );

      if (status_code === '2') {
        await UserCourseAccess.create({
          userId,
          courseId,
          purchasedAt: new Date(),
          expiresAt: getNext8th()
        });
        await PaymentInquiry.findOneAndUpdate(
          { userId, courseId, status: 'approved' },
          { status: 'paid' }
        );

        try {
          const user = await User.findById(userId);
          const course = await Course.findById(courseId);
          if (user && course) {
            const msg = `Your payment for ${course.title} has been approved.`;
            await sendWhatsapp(user.phoneNumber, msg);
            const adminMsg = `${user.firstName} ${user.lastName} completed a payment for ${course.title}.`;
            await notifyAdmins(adminMsg);
          }
        } catch (e) {
          console.error('WhatsApp notify error:', e.message);
        }
      }
    }

    res.send('OK');
  } catch (error) {
    console.error('Notify error:', error.message);
    res.send('OK');
  }
};

// Helper: Convert PayHere status code to readable status
const getPaymentStatus = (code) => {
  switch (code) {
    case '2': return 'completed';
    case '0': return 'pending';
    case '-1': return 'cancelled';
    case '-2': return 'failed';
    case '-3': return 'charged_back';
    default: return 'unknown';
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const payments = await Payment.find({ userId })
      .populate('courseId', 'title description')
      .sort({ createdAt: -1 });

    res.json({ success: true, payments });
  } catch (error) {
    console.error('History error:', error.message);
    res.status(500).json({ message: 'Failed to fetch payment history' });
  }
};

// Verify Payment Status
exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;
    const requesterId = req.user.userId;
    const isAdmin = req.user.userRole === 'admin';

    const payment = await Payment.findOne(orderId ? { orderId } : { paymentId })
      .populate('courseId', 'title description')
      .populate('userId', 'firstName lastName email');

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    if (!isAdmin && payment.userId._id.toString() !== requesterId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const paymentUserId = payment.userId._id;

    if (payment.status === 'completed') {
      const existing = await UserCourseAccess.findOne({
        userId: paymentUserId,
        courseId: payment.courseId._id,
        expiresAt: { $gt: new Date() }
      });

      if (!existing) {
        await UserCourseAccess.create({
          userId: paymentUserId,
          courseId: payment.courseId._id,
          purchasedAt: payment.completedAt || new Date(),
          expiresAt: getNext8th()
        });
        await PaymentInquiry.findOneAndUpdate(
          { userId: paymentUserId, courseId: payment.courseId._id, status: 'approved' },
          { status: 'paid' }
        );
      }
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ message: 'Verification failed' });
  }
};

// Get all payments (Admin only)
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('courseId', 'title')
      .populate('userId', 'firstName lastName');
    res.json({ success: true, payments });
  } catch (error) {
    console.error('Get all payments error:', error.message);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
};

// Admin approve payment manually
exports.adminApprovePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) return res.status(400).json({ message: 'Order id required' });

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'completed') {
      return res.status(400).json({ message: 'Payment already completed' });
    }

    payment.status = 'completed';
    payment.completedAt = new Date();
    payment.paymentData = {
      ...(payment.paymentData || {}),
      adminApprovedAt: new Date()
    };
    await payment.save();

    await UserCourseAccess.create({
      userId: payment.userId,
      courseId: payment.courseId,
      purchasedAt: payment.completedAt,
      expiresAt: getNext8th()
    });
  await PaymentInquiry.findOneAndUpdate(
      { userId: payment.userId, courseId: payment.courseId, status: 'approved' },
      { status: 'paid' }
    );

    try {
      const user = await User.findById(payment.userId);
      const course = await Course.findById(payment.courseId);
      if (user && course) {
        const msg = `Your payment for ${course.title} has been approved.`;
        await sendWhatsapp(user.phoneNumber, msg);
      }
    } catch (e) {
      console.error('WhatsApp notify error:', e.message);
    }

    res.json({ success: true, payment });
  } catch (error) {
    console.error('Admin approve error:', error.message);
    res.status(500).json({ message: 'Payment approval failed' });
  }
};
