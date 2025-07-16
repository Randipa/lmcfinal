const mongoose = require('mongoose');

const assignmentSubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileUrl: { type: String, required: true },
  originalName: { type: String, required: true },
  marks: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AssignmentSubmission', assignmentSubmissionSchema);
