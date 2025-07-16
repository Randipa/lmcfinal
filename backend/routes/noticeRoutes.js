const express = require('express');
const router = express.Router();
const controller = require('../controllers/noticeController');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireTeacher, controller.createNotice);
router.get('/', controller.getNotices);
router.get('/my', authenticateToken, controller.getMyNotices);

module.exports = router;
