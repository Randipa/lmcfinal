const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentInquiryController');
const {
  authenticateToken,
  optionalAuthenticate,
  requireAdmin
} = require('../middleware/authMiddleware');

router.post('/', optionalAuthenticate, controller.createInquiry);
router.get('/my', authenticateToken, controller.getMyInquiries);
router.get('/', authenticateToken, requireAdmin, controller.getInquiries);
router.put('/:id/approve', authenticateToken, requireAdmin, controller.approveInquiry);

module.exports = router;
