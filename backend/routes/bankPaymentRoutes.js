const express = require('express');
const router = express.Router();
const controller = require('../controllers/bankPaymentController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const uploadBankSlip = require('../middleware/uploadBankSlip');

router.post('/submit', authenticateToken, uploadBankSlip.single('slip'), controller.submitBankPayment);
router.put('/approve/:requestId', authenticateToken, requireAdmin, controller.approveBankPayment);
router.get('/download/:requestId', authenticateToken, requireAdmin, controller.downloadBankSlip);
router.get('/requests', authenticateToken, requireAdmin, controller.getBankPaymentRequests);
router.get('/my', authenticateToken, controller.getMyBankPayments);

module.exports = router;
