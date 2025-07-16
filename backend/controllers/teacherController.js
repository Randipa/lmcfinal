const Teacher = require('../models/Teacher');
const User = require('../models/User');

exports.createTeacher = async (req, res) => {
  try {
    const { classes, ...data } = req.body;
    const teacher = new Teacher(data);

    if (Array.isArray(classes) && classes.length > 0) {
      teacher.classes = classes;
      if (!teacher.grade && classes[0].grade) teacher.grade = classes[0].grade;
      if (!teacher.subject && classes[0].subject) teacher.subject = classes[0].subject;
    }

    await teacher.save();

    // also create a user account for the teacher if phoneNumber provided
    if (teacher.phoneNumber && teacher.email) {
      const existing = await User.findOne({ phoneNumber: teacher.phoneNumber });
      if (!existing) {
        const user = new User({
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          phoneNumber: teacher.phoneNumber,
          password: teacher.email,
          education: 'N/A',
          address: 'N/A',
          userRole: 'teacher'
        });
        await user.save();
      }
    }

    res.status(201).json({ teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create teacher' });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const { grade, subject } = req.query;
    const query = {};

    if (grade && subject) {
      const g = parseInt(grade, 10);
      query.$or = [
        { grade: g, subject },
        { classes: { $elemMatch: { grade: g, subject } } }
      ];
    } else if (grade) {
      const g = parseInt(grade, 10);
      query.$or = [{ grade: g }, { 'classes.grade': g }];
    } else if (subject) {
      query.$or = [{ subject }, { 'classes.subject': subject }];
    }

    const teachers = await Teacher.find(query).sort({ createdAt: -1 });
    res.json({ teachers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch teachers' });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch teacher' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { classes, ...data } = req.body;

    if (Array.isArray(classes) && classes.length > 0) {
      data.classes = classes;
      if (!data.grade && classes[0].grade) data.grade = classes[0].grade;
      if (!data.subject && classes[0].subject) data.subject = classes[0].subject;
    }

    const teacher = await Teacher.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true
    });
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ teacher });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update teacher' });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete teacher' });
  }
};

// Get courses taught by a specific teacher
exports.getTeacherCourses = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    const Course = require('../models/Course');
    const name = `${teacher.firstName} ${teacher.lastName}`;
    const courses = await Course.find({ teacherName: name });
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Get courses for the logged in teacher
exports.getMyCourses = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const Course = require('../models/Course');
    const name = `${user.firstName} ${user.lastName}`;
    const courses = await Course.find({ teacherName: name });
    res.json({ courses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch courses' });
  }
};

// Get distinct subjects for a given grade
exports.getAvailableSubjects = async (req, res) => {
  try {
    const grade = parseInt(req.query.grade, 10);
    if (!grade) {
      return res.status(400).json({ message: 'Grade is required' });
    }

    const teachers = await Teacher.find({
      $or: [{ grade }, { 'classes.grade': grade }]
    });

    const subjectSet = new Set();
    teachers.forEach((t) => {
      if (t.grade === grade && t.subject) subjectSet.add(t.subject);
      if (Array.isArray(t.classes)) {
        t.classes.forEach((c) => {
          if (c.grade === grade && c.subject) subjectSet.add(c.subject);
        });
      }
    });

    res.json({ subjects: Array.from(subjectSet) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
};
