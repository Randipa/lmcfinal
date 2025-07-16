const axios = require('axios');
const waConfig = require('../config/quicksendWAConfig');

// Normalize phone to international format (expects Sri Lankan numbers like 07xxxxxxx)
const formatNumber = (phone) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return `94${digits.slice(1)}`;
  return digits;
};

module.exports = async (phone, message) => {
  try {
    if (!waConfig.slotId) throw new Error('WhatsApp slot ID not configured');

    const payload = {
      slotId: waConfig.slotId,
      isGroup: false,
      withFile: false,
      receiver: formatNumber(phone),
      msg: message
    };

    const auth = Buffer.from(`${waConfig.email}:${waConfig.apiKey}`).toString('base64');
    const { data } = await axios.post(waConfig.apiUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`
      }
    });
    return { success: true, data };
  } catch (err) {
    console.error('WhatsApp send error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
};
