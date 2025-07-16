const User = require('../models/User');
const sendWhatsapp = require('./sendWhatsappMessage');

module.exports = async function notifyAdmins(message) {
  try {
    const admins = await User.find({ userRole: 'admin', phoneNumber: { $exists: true } });
    for (const admin of admins) {
      if (admin.phoneNumber) {
        await sendWhatsapp(admin.phoneNumber, message);
      }
    }
  } catch (err) {
    console.error('Admin notify error:', err.message);
  }
};
