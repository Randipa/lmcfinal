const Assignment = require('../models/Assignment');
const UserCourseAccess = require('../models/UserCourseAccess');
const User = require('../models/User');
const Course = require('../models/Course');
const sendWhatsapp = require('../utils/sendWhatsappMessage');

exports.createAssignment = async (req, res) => {
  try {
    const { courseId, title, description } = req.body;
    const teacherId = req.user.userId;
    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `${req.protocol}://${req.get('host')}`);
    const fileUrl = req.file ? `${baseUrl}/uploads/assignments/${req.file.filename}` : undefined;
    const assignment = new Assignment({ courseId, teacherId, title, description, fileUrl });
    await assignment.save();

    try {
      const course = await Course.findById(courseId);
      const accesses = await UserCourseAccess.find({
        courseId,
        expiresAt: { $gt: new Date() }
      }).populate('userId', 'phoneNumber');

      for (const access of accesses) {
        const user = access.userId;
        if (user?.phoneNumber) {
          const msg = `New assignment "${title}" added for ${course?.title || ''}`.trim();
          await sendWhatsapp(user.phoneNumber, msg);
        }
      }
    } catch (e) {
      console.error('WhatsApp notify error:', e.message);
    }

    res.status(201).json({ assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
};

exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId }).sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get assignments' });
  }
};

exports.getAssignmentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const assignments = await Assignment.find({ teacherId })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get assignments' });
  }
};

exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get assignment' });
  }
};
