const User = require('../models/User');
const UserCourseAccess = require('../models/UserCourseAccess');
const Course = require('../models/Course');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -otp');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get users by role (Admin only)
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['student', 'teacher', 'assistant', 'admin'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const users = await User.find({ userRole: role }).select('-password -otp');
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getMyCourses = async (req, res) => {
  const userId = req.user.userId;
  const accessList = await UserCourseAccess.find({ userId, expiresAt: { $gt: new Date() } }).populate('courseId');
  const courses = accessList.map(access => access.courseId);
  // For the dashboard, the frontend expects the enrolled classes under the
  // `classes` key. Keep this naming to avoid breaking the existing UI.
  res.json({ classes: courses });
};

// Create a new user (Admin only)
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, password, userRole, education, address } = req.body;

    if (!firstName || !lastName || !phoneNumber || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const validRoles = ['student', 'teacher', 'assistant', 'admin'];
    if (userRole && !validRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const existing = await User.findOne({ phoneNumber });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      firstName,
      lastName,
      phoneNumber,
      password,
      education: education || 'N/A',
      address: address || 'N/A',
      userRole: userRole || 'assistant'
    });

    await newUser.save();

    res.status(201).json({
      user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        userRole: newUser.userRole
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user role (Admin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { userRole } = req.body;
    
    const validRoles = ['student', 'teacher', 'assistant', 'admin'];
    
    if (!validRoles.includes(userRole)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.userRole = userRole;
    await user.save();

    res.json({ 
      message: 'User role updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        userRole: user.userRole
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, education, address } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only allow users to update their own profile, unless they're admin
    if (req.user.userRole !== 'admin' && userId !== req.user.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (education) user.education = education;
    if (address) user.address = address;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        education: user.education,
        address: user.address,
        userRole: user.userRole
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};