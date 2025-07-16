const connectDB = require('../config/db');

module.exports = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err);
    next(err);
  }
};
