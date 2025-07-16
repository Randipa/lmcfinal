const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    grade: { type: Number },
    subject: { type: String },
    email: { type: String },
    phoneNumber: { type: String },
    description: { type: String },
    classes: [
      {
        grade: { type: Number, required: true },
        subject: { type: String, required: true }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Teacher', teacherSchema);
