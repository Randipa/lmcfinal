const express = require('express');
const router = express.Router();
const bunnyController = require('../controllers/bunnyController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/bunny/videos', authenticateToken, requireAdmin, bunnyController.listVideos);

module.exports = router;
