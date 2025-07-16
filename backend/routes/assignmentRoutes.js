const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignmentController');
const { authenticateToken, requireTeacher, requireTeacherOrAssistant } = require('../middleware/authMiddleware');
const { checkCourseAccess } = require('../middleware/courseAccessMiddleware');
const uploadAssignment = require('../middleware/uploadAssignment');
const submissionRoutes = require('./assignmentSubmissionRoutes');

router.post('/', authenticateToken, requireTeacher, uploadAssignment.single('file'), controller.createAssignment);
router.get('/course/:courseId', authenticateToken, checkCourseAccess, controller.getAssignmentsByCourse);
router.get('/teacher/:teacherId', authenticateToken, requireTeacherOrAssistant, controller.getAssignmentsByTeacher);
router.get('/:id', authenticateToken, controller.getAssignmentById);

router.use('/:assignmentId/submissions', submissionRoutes);

module.exports = router;
