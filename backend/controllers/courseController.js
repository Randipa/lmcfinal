const Course = require('../models/Course');
const jwt = require('jsonwebtoken');
const UserCourseAccess = require('../models/UserCourseAccess');

// Create a new course
exports.createCourse = async (req, res) => {
  try {
    const { title, description, price, durationInDays, type, grade, subject, teacherName } = req.body;

    if (!title || !price) {
      return res.status(400).json({ message: 'Title and price are required' });
    }

    const newCourse = new Course({
      title,
      description,
      price: parseFloat(price),
      durationInDays: durationInDays || 30,
      type: type || 'class',
      grade,
      subject,
      teacherName,
      createdBy: req.user?.userId || null
    });

    await newCourse.save();
    res.status(201).json({ message: 'Course created successfully', course: newCourse });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
  try {
    const { type, grade, subject, teacherName, search, minPrice, maxPrice } = req.query;
    let query = {};

    if (type) query.type = type;
    if (grade) query.grade = grade;
    if (subject) query.subject = subject;
    if (teacherName) query.teacherName = teacherName;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });
    res.json({ message: 'Courses retrieved successfully', count: courses.length, courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error while fetching courses', error: error.message });
  }
};

// Get course by ID
exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let hasAccess = false;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const access = await UserCourseAccess.findOne({
          userId: decoded.userId,
          courseId: id,
          expiresAt: { $gt: new Date() }
        });
        hasAccess = !!access;
      } catch (err) {
        // ignore token errors
      }
    }

    const courseObj = course.toObject();
    const authToken = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (authToken) {
      try {
        const decodedAdmin = jwt.verify(authToken, process.env.JWT_SECRET);
        isAdmin = decodedAdmin.userRole === 'admin';
      } catch {}
    }

    if (!isAdmin) {
      courseObj.courseContent = courseObj.courseContent.filter(c => !c.hidden);
    }

    if (!hasAccess) {
      const now = new Date();
      courseObj.courseContent = courseObj.courseContent.map((c) => {
        const isAvailable =
          c.isPublic || (c.visibleFrom && new Date(c.visibleFrom) <= now);
        if (isAvailable) {
          return {
            title: c.title,
            videoUrl: c.videoUrl,
            isPublic: c.isPublic,
            visibleFrom: c.visibleFrom,
            subtitles: c.subtitles,
          };
        }
        return {
          title: c.title,
          isPublic: c.isPublic,
          visibleFrom: c.visibleFrom,
        };
      });
    }

    res.json({ message: 'Course retrieved successfully', course: courseObj, hasAccess });
  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({ message: 'Error fetching course', error: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, durationInDays, type, grade, subject, teacherName } = req.body;

    const course = await Course.findByIdAndUpdate(
      id,
      {
        title,
        description,
        price: parseFloat(price),
        durationInDays: durationInDays || 30,
        type: type || 'class',
        grade,
        subject,
        teacherName
      },
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// Update an entire course including its content array
exports.updateFullCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      price,
      durationInDays,
      type,
      grade,
      subject,
      teacherName,
      courseContent
    } = req.body;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = parseFloat(price);
    if (durationInDays !== undefined) course.durationInDays = durationInDays;
    if (type !== undefined) course.type = type;
    if (grade !== undefined) course.grade = grade;
    if (subject !== undefined) course.subject = subject;
    if (teacherName !== undefined) course.teacherName = teacherName;

    if (Array.isArray(courseContent)) {
      course.courseContent = courseContent.map((c) => ({
        title: c.title,
        videoId: c.videoId,
        videoUrl: c.videoUrl,
        description: c.description,
        duration: c.duration,
        hidden: !!c.hidden,
        isPublic: !!c.isPublic,
        visibleFrom: c.visibleFrom ? new Date(c.visibleFrom) : null,
        subtitles: Array.isArray(c.subtitles)
          ? c.subtitles.map((s) => ({ language: s.language, url: s.url }))
          : []
      }));
    }

    await course.save();
    res.json({ message: 'Course updated successfully', course });
  } catch (error) {
    console.error('Update full course error:', error);
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

// Delete course
exports.deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findByIdAndDelete(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    res.json({ message: 'Course deleted successfully', course });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

// Retrieve only course content
exports.getCourseContent = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await Course.findById(id, 'courseContent title');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const authToken = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (authToken) {
      try {
        const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
        isAdmin = decoded.userRole === 'admin';
      } catch {}
    }

    const filterHidden = c => !c.hidden || isAdmin;

    const paidContent = course.courseContent.filter(c => !c.isPublic && filterHidden(c));
    const unpaidContent = course.courseContent.filter(c => c.isPublic && filterHidden(c));
    const subtitles = course.courseContent.filter(filterHidden).flatMap(c =>
      c.subtitles.map(s => ({
        id: s._id,
        videoId: c.videoId,
        videoTitle: c.title,
        language: s.language,
        filename: s.filename,
        url: s.url
      }))
    );

    res.json({ paidContent, unpaidContent, subtitles });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Failed to get course content', error: error.message });
  }
};

// Add Bunny.net video to a course
exports.addCourseContent = async (req, res) => {
  try {
    const { title, videoId, videoUrl, isPublic, visibleFrom, subtitles, contentType, description, duration, hidden } = req.body;
    const courseId = req.params.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    course.courseContent.push({
      title,
      videoId,
      videoUrl,
      description,
      duration,
      hidden: !!hidden,
      isPublic: typeof isPublic === 'boolean' ? isPublic : contentType === 'unpaid',
      visibleFrom,
      subtitles
    });

    await course.save();
    res.json({ message: 'Content added to course', course });
  } catch (error) {
    console.error('Add content error:', error);
    res.status(500).json({ message: 'Failed to add course content', error: error.message });
  }
};

// Update a course content item
exports.updateCourseContent = async (req, res) => {
  try {
    const { id, contentId } = req.params;
    const update = req.body;

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const content = course.courseContent.id(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    content.title = update.title ?? content.title;
    content.videoId = update.videoId ?? content.videoId;
    content.videoUrl = update.videoUrl ?? content.videoUrl;
    if (update.description !== undefined) content.description = update.description;
    if (update.duration !== undefined) content.duration = update.duration;
    if (update.hidden !== undefined) content.hidden = update.hidden;
    if (update.isPublic !== undefined) content.isPublic = update.isPublic;
    if (update.visibleFrom !== undefined)
      content.visibleFrom = update.visibleFrom ? new Date(update.visibleFrom) : null;
    if (update.subtitles) content.subtitles = update.subtitles;

    await course.save();
    res.json({ message: 'Content updated', content });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(500).json({ message: 'Failed to update course content', error: error.message });
  }
};

// Delete a course content item
exports.deleteCourseContent = async (req, res) => {
  try {
    const { id, contentId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const content = course.courseContent.id(contentId);
    if (!content) return res.status(404).json({ message: 'Content not found' });

    content.deleteOne();
    await course.save();
    res.json({ message: 'Content deleted' });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(500).json({ message: 'Failed to delete course content', error: error.message });
  }
};

// Upload subtitle file and attach to a video
exports.uploadSubtitle = async (req, res) => {
  try {
    const { id } = req.params;
    const { videoId, language } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'Subtitle file required' });

    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const content = course.courseContent.find(c => c.videoId === videoId || c._id.toString() === videoId);
    if (!content) return res.status(404).json({ message: 'Video not found' });

    const subtitle = {
      language,
      filename: file.originalname,
      url: `/uploads/subtitles/${file.filename}`
    };

    content.subtitles.push(subtitle);
    await course.save();

    res.json(content.subtitles[content.subtitles.length - 1]);
  } catch (error) {
    console.error('Upload subtitle error:', error);
    res.status(500).json({ message: 'Failed to upload subtitle', error: error.message });
  }
};

// Delete subtitle
exports.deleteSubtitle = async (req, res) => {
  try {
    const { id, subtitleId } = req.params;
    const course = await Course.findById(id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    let removed = false;
    for (const content of course.courseContent) {
      const sub = content.subtitles.id(subtitleId);
      if (sub) {
        sub.deleteOne();
        removed = true;
        break;
      }
    }

    if (!removed) return res.status(404).json({ message: 'Subtitle not found' });

    await course.save();
    res.json({ message: 'Subtitle deleted' });
  } catch (error) {
    console.error('Delete subtitle error:', error);
    res.status(500).json({ message: 'Failed to delete subtitle', error: error.message });
  }
};

// Course statistics
exports.getCourseStats = async (req, res) => {
  try {
    const totalCourses = await Course.countDocuments();
    const classCourses = await Course.countDocuments({ type: 'class' });
    const moduleCourses = await Course.countDocuments({ type: 'module' });

    const priceStats = await Course.aggregate([
      {
        $group: {
          _id: null,
          averagePrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);

    res.json({
      message: 'Course statistics retrieved successfully',
      stats: {
        totalCourses,
        classCourses,
        moduleCourses,
        averagePrice: priceStats[0]?.averagePrice || 0,
        minPrice: priceStats[0]?.minPrice || 0,
        maxPrice: priceStats[0]?.maxPrice || 0
      }
    });
  } catch (error) {
    console.error('Get course stats error:', error);
    res.status(500).json({ message: 'Failed to get stats', error: error.message });
  }
};

// Return distinct grades that have courses
exports.getAvailableGrades = async (req, res) => {
  try {
    const grades = await Course.distinct('grade');
    res.json({ grades });
  } catch (error) {
    console.error('Get grades error:', error);
    res.status(500).json({ message: 'Failed to fetch grades' });
  }
};
