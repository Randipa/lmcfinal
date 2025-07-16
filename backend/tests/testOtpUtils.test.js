const { generateOtp } = require('../utils/otpUtils');

test('generateOtp returns a 6-digit numeric string', () => {
  const otp = generateOtp();
  expect(typeof otp).toBe('string');
  expect(otp).toMatch(/^\d{6}$/);
});
