const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  education: { type: String, required: true },
  address: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'teacher', 'assistant', 'admin'], 
    default: 'student' 
  },
  otp: { type: String },
  otpExpiresAt: { type: Date }
}, {
  timestamps: true // This adds createdAt and updatedAt fields
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);