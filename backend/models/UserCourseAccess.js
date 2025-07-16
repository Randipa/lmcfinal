const mongoose = require('mongoose');

const userCourseAccessSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  purchasedAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth() + 1, 8);
    }
  }
});

module.exports = mongoose.model('UserCourseAccess', userCourseAccessSchema);
