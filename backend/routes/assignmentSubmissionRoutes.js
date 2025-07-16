const express = require('express');
const router = express.Router({ mergeParams: true });
const controller = require('../controllers/assignmentSubmissionController');
const { authenticateToken, requireTeacher, requireTeacherOrAssistant } = require('../middleware/authMiddleware');
const uploadSubmission = require('../middleware/uploadSubmission');

router.post('/', authenticateToken, uploadSubmission.single('file'), controller.submitAssignment);
router.get('/', authenticateToken, requireTeacherOrAssistant, controller.getSubmissions);
router.get('/mine', authenticateToken, controller.getMySubmission);
router.put('/:submissionId/mark', authenticateToken, requireTeacherOrAssistant, controller.markSubmission);

module.exports = router;
