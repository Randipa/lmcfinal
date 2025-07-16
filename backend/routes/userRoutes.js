const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');


// Get user profile - All authenticated users
router.get('/profile', authMiddleware.authenticateToken, userController.getUserProfile);

// Update user profile - All authenticated users (can only update their own)
router.put('/profile', authMiddleware.authenticateToken, userController.updateUserProfile);

router.get('/my-courses', authenticateToken, userController.getMyCourses);

// Get all users - Admin only
router.get('/all', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  userController.getAllUsers
);

// Get users by role - Admin only
router.get('/role/:role', 
  authMiddleware.authenticateToken, 
  authMiddleware.requireAdmin, 
  userController.getUsersByRole
);

// Update user role - Admin only
router.put('/:userId/role',
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  userController.updateUserRole
);

// Create a new user - Admin only
router.post('/',
  authMiddleware.authenticateToken,
  authMiddleware.requireAdmin,
  userController.createUser
);

module.exports = router;