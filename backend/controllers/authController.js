const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const otpUtils = require('../utils/otpUtils');
const quicksendConfig = require('../config/quicksendConfig');
const axios = require('axios');

// Global state for pending registrations
const pendingRegistrations = {};

// Normalize phone number
const normalizePhoneNumber = (phoneNumber) => {
  const digits = phoneNumber.replace(/\D/g, '');

  if (digits.length === 10 && digits.startsWith('07')) {
    return digits;
  }

  throw new Error('Invalid phone number format');
};

// Send OTP via SMS
const sendOtpSms = async (phoneNumber, otp) => {
  try {
    const message = `Your OTP is: ${otp}`;
    const auth = Buffer.from(`${quicksendConfig.email}:${quicksendConfig.apiKey}`).toString('base64');

    const response = await axios.post(quicksendConfig.apiUrl, {
      senderID: quicksendConfig.senderId,
      to: phoneNumber,
      msg: message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error('SMS Error:', error.response?.data || error.message);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Controller Functions

// Send OTP for registration
exports.sendRegistrationOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if phone number already exists
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Generate and store OTP
    const otp = otpUtils.generateOtp();
    pendingRegistrations[normalizedPhone] = {
      otp,
      expiresAt: Date.now() + 300000, // 5 minutes
      verified: false
    };

    // Send OTP via SMS
    const smsResult = await sendOtpSms(normalizedPhone, otp);
    if (!smsResult.success) {
      return res.status(500).json({ message: 'Failed to send OTP' });
    }

    res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      message: error.message.includes('Invalid phone number')
        ? error.message
        : 'Failed to send OTP'
    });
  }
};

// Verify OTP for registration
exports.verifyRegistrationOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;

    if (!phoneNumber || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);
    const storedOtp = pendingRegistrations[normalizedPhone];

    if (!storedOtp) {
      return res.status(400).json({ message: 'OTP not found. Please request a new OTP.' });
    }

    if (storedOtp.expiresAt < Date.now()) {
      delete pendingRegistrations[normalizedPhone];
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Mark OTP as verified
    pendingRegistrations[normalizedPhone].verified = true;

    res.json({ message: 'Phone number verified successfully' });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      message: error.message.includes('Invalid phone number')
        ? error.message
        : 'Failed to verify OTP'
    });
  }
};

// Register user after OTP verification
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, confirmPassword, education, address, userRole } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !phoneNumber || !password || !confirmPassword || !education || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    // Validate userRole if provided
    const validRoles = ['student', 'teacher', 'assistant', 'admin'];
    if (userRole && !validRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Invalid user role' });
    }

    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Check if phone number is verified
    const registrationData = pendingRegistrations[normalizedPhone];
    if (!registrationData || !registrationData.verified) {
      return res.status(400).json({ message: 'Please verify your phone number first' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ phoneNumber: normalizedPhone });
    if (existingUser) {
      return res.status(400).json({ message: 'Phone number already registered' });
    }

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      phoneNumber: normalizedPhone,
      password,
      education,
      address,
      userRole: userRole || 'student' // Default to 'student' if not provided
    });

    // Save user to the database (password will be hashed by the pre-save hook)
    await newUser.save();

    // Clean up pending registration
    delete pendingRegistrations[normalizedPhone];

    // Generate JWT token
    const token = jwt.sign({ userId: newUser._id, userRole: newUser.userRole }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Return success response
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        userRole: newUser.userRole
      },
      token
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      message: error.message.includes('Invalid phone number')
        ? error.message
        : 'Registration failed'
    });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;

    if (!phoneNumber || !password) {
      return res.status(400).json({ message: 'Phone number and password are required' });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Find user by normalized phone number
    const user = await User.findOne({ phoneNumber: normalizedPhone });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare plain text password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token with user role
    const token = jwt.sign({ userId: user._id, userRole: user.userRole }, process.env.JWT_SECRET, { expiresIn: '24h' });

    // Return success response
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole
      },
      token
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      message: error.message.includes('Invalid phone number')
        ? error.message
        : 'Login failed'
    });
  }
};

// Send OTP via QuickSend
exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = otpUtils.generateOtp();
    user.otp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
    await user.save();

    const message = `Your OTP is: ${otp}`;

    // Prepare auth header
    const auth = Buffer.from(`${quicksendConfig.email}:${quicksendConfig.apiKey}`).toString('base64');

    // Prepare payload
    const data = {
      senderID: quicksendConfig.senderId,
      to: phoneNumber,
      msg: message
    };

    // Make request
    const response = await axios.post(quicksendConfig.apiUrl, data, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      }
    });

    console.log("QuickSend Response:", response.data);

    res.json({ message: 'OTP sent successfully' });

  } catch (error) {
    console.error("QuickSend Error:", error.message);
    console.error("Full Error:", error.response?.data || error);

    return res.status(500).json({
      message: 'Failed to send OTP',
      error: error.response?.data || error.message
    });
  }
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp } = req.body;
    const user = await User.findOne({ phoneNumber });

    if (!user || !user.otp || user.otp !== otp || user.otpExpiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    user.otp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { phoneNumber, newPassword, confirmNewPassword } = req.body;

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};