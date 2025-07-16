import { useState } from 'react';
import api from '../../api';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    education: '',
    address: ''
  });
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState('');

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendOtp = async () => {
    setMsg('');
    try {
      await api.post('/auth/send-otp', { phoneNumber: form.phoneNumber });
      setOtpSent(true);
      setMsg('OTP sent. Please check your phone.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const verifyOtp = async () => {
    setMsg('');
    try {
      await api.post('/auth/verify-reg-otp', {
        phoneNumber: form.phoneNumber,
        otp
      });
      setVerified(true);
      setMsg('Phone number verified.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to verify OTP.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!verified) {
      setMsg('Please verify your phone number first.');
      return;
    }
    try {
      await api.post('/auth/register', form);
      setMsg('Registered successfully! You can now login.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="container py-5">
      <h3>Register</h3>
      <form onSubmit={handleRegister}>
        {['firstName', 'lastName', 'password', 'confirmPassword', 'education', 'address'].map(field => (
          <input
            key={field}
            name={field}
            className="form-control mb-2"
            type={field.includes('password') ? 'password' : 'text'}
            placeholder={field.replace(/([A-Z])/g, ' $1')}
            onChange={handleChange}
            required
          />
        ))}

        <div className="input-group mb-2">
          <input
            name="phoneNumber"
            className="form-control"
            type="text"
            placeholder="Phone Number"
            onChange={handleChange}
            required
          />
          <button type="button" className="btn btn-outline-secondary" onClick={sendOtp}>
            Send OTP
          </button>
        </div>

        {otpSent && !verified && (
          <div className="input-group mb-2">
            <input
              className="form-control"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
            />
            <button type="button" className="btn btn-outline-secondary" onClick={verifyOtp}>
              Verify
            </button>
          </div>
        )}

        <button className="btn btn-success">Register</button>
        {msg && <div className="alert alert-info mt-3">{msg}</div>}
      </form>
    </div>
  );
};

export default Register;
