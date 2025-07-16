require('dotenv').config();

module.exports = {
  email: process.env.QUICKSEND_EMAIL,
  apiKey: process.env.QUICKSEND_API_KEY,
  slotId: process.env.WHATSAPP_SLOT_ID,
  apiUrl: process.env.WHATSAPP_API_URL || 'https://quicksend.lk/Client/wtsp-api.php'
};
