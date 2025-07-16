const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const rateLimit = require('express-rate-limit');

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many OTP requests from this IP, please try again later'
});



router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.post('/forgot-password', authController.sendOtp);
router.post('/verify-otp', authController.verifyOtp);
router.post('/reset-password', authController.resetPassword);

// Registration OTP Flow
router.post('/send-otp', authController.sendRegistrationOtp);
router.post('/verify-reg-otp', authController.verifyRegistrationOtp);



module.exports = router;