const express = require('express');
const router = express.Router();
const controller = require('../controllers/teacherController');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireAdmin, controller.createTeacher);
router.get('/', controller.getTeachers);
router.get('/available-subjects', controller.getAvailableSubjects);
router.get('/me/courses', authenticateToken, requireTeacher, controller.getMyCourses);
router.get('/:id', controller.getTeacherById);
router.get('/:id/courses', controller.getTeacherCourses);
router.put('/:id', authenticateToken, requireAdmin, controller.updateTeacher);
router.delete('/:id', authenticateToken, requireAdmin, controller.deleteTeacher);

module.exports = router;
