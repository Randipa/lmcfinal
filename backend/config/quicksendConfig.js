require('dotenv').config();

module.exports = {
  email: process.env.QUICKSEND_EMAIL,
  apiKey: process.env.QUICKSEND_API_KEY,
  senderId: process.env.QUICKSEND_SENDER_ID,
  apiUrl: process.env.QUICKSEND_URL
};