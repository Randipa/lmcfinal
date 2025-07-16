const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const videoController = require('../controllers/uploadCourseVideo');
const upload = require('../middleware/upload');
const uploadSubtitle = require('../middleware/uploadSubtitle');
const { authenticateToken, requireAdmin, requireTeacher } = require('../middleware/authMiddleware');

// Course CRUD
router.post('/courses', authenticateToken, requireTeacher, courseController.createCourse);
router.get('/courses', courseController.getAllCourses);
router.get('/courses/stats', courseController.getCourseStats);
router.get('/courses/available-grades', courseController.getAvailableGrades);
router.get('/courses/:id', courseController.getCourseById);
router.put('/courses/:id', authenticateToken, requireTeacher, courseController.updateCourse);
router.delete('/courses/:id', authenticateToken, requireTeacher, courseController.deleteCourse);
router.put('/courses/:id/full', authenticateToken, requireAdmin, courseController.updateFullCourse);

// Add course content (manual embed or Bunny.net metadata)
router.get('/courses/:id/content', courseController.getCourseContent);
router.post('/courses/:id/content', authenticateToken, requireTeacher, courseController.addCourseContent);
router.put('/courses/:id/content/:contentId', authenticateToken, requireTeacher, courseController.updateCourseContent);
router.delete('/courses/:id/content/:contentId', authenticateToken, requireTeacher, courseController.deleteCourseContent);

// Subtitle management
router.post('/courses/:id/subtitles', authenticateToken, requireTeacher, uploadSubtitle.single('subtitleFile'), courseController.uploadSubtitle);
router.delete('/courses/:id/subtitles/:subtitleId', authenticateToken, requireTeacher, courseController.deleteSubtitle);

// Upload video file directly to Bunny.net and attach to course
router.post('/courses/:id/upload-video', authenticateToken, requireTeacher, upload.single('video'), videoController.uploadCourseVideo);

module.exports = router;
