// app.js
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const ensureDb = require('./middleware/dbConnect');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bankPaymentRoutes = require('./routes/bankPaymentRoutes');
const bunnyRoutes = require('./routes/bunnyRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const productRoutes = require('./routes/productRoutes');
const paymentInquiryRoutes = require('./routes/paymentInquiryRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const libraryRoutes = require('./routes/libraryRoutes');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(ensureDb);

// Serve uploaded files. When running in a serverless environment such as Vercel
// the application directory is read-only, so store temporary uploads in /tmp.
const defaultUploadDir = path.join(__dirname, 'uploads');
const uploadsDir = process.env.UPLOAD_DIR || (process.env.VERCEL ? '/tmp/uploads' : defaultUploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// Session Middleware (required if using session in payment flow)
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback_session_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // true if in production (HTTPS)
      maxAge: 1000 * 60 * 10 // 10 minutes
    }
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bank-payment', bankPaymentRoutes);
app.use('/api', courseRoutes);
app.use('/api', bunnyRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api', productRoutes);
app.use('/api/inquiries', paymentInquiryRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api', libraryRoutes);

// Database connection handled via middleware for each request

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);

    // Log environment variables status (without exposing values)
    console.log(' Environment check:');
    console.log(`   MONGO_URI: ${process.env.MONGO_URI ? ' Set' : ' Missing'}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? ' Set' : ' Missing'}`);
    console.log(`   BUNNY_API_KEY: ${process.env.BUNNY_API_KEY ? ' Set' : ' Missing'}`);
    console.log(`   BUNNY_LIBRARY_ID: ${process.env.BUNNY_LIBRARY_ID ? ' Set' : ' Missing'}`);
    console.log(`   PAYHERE_MERCHANT_ID: ${process.env.PAYHERE_MERCHANT_ID ? ' Set' : ' Missing'}`);
  });
}

module.exports = app;
