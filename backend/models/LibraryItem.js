const mongoose = require('mongoose');

const libraryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: {
    type: String,
    enum: ['passpaper', 'book', 'document', 'video', 'other'],
    required: true
  },
  grade: String,
  subject: String,
  fileUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LibraryItem', libraryItemSchema);
