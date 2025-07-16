const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  grade: { type: String },
  subject: { type: String },
  teacherName: { type: String },

  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Course price is required'],
    min: [0, 'Course price cannot be negative']
  },
  durationInDays: {
    type: Number,
    default: 30,
    min: [1, 'Course duration must be at least 1 day']
  },
  type: {
    type: String,
    enum: ['module', 'class'],
    default: 'class'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  enrollmentCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  courseContent: [
    {
      title: String,
      videoId: String, // Bunny video GUID
      videoUrl: String, // embed url
      description: String,
      duration: String,
      hidden: { type: Boolean, default: false },
      isPublic: { type: Boolean, default: false },
      visibleFrom: Date,
      subtitles: [
        {
          language: String,
          filename: String,
          url: String
        }
      ]
    }
  ]
}, { timestamps: true });

courseSchema.index({ type: 1, isActive: 1 });
courseSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Course', courseSchema);
