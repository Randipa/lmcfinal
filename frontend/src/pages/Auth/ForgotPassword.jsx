import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const ForgotPassword = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('request');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const sendOtp = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/forgot-password', { phoneNumber });
      setStep('verify');
      setMsg('OTP sent. Please check your phone.');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to send OTP.');
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/verify-otp', { phoneNumber, otp });
      navigate('/reset-password', { state: { phoneNumber } });
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to verify OTP.');
    }
  };

  return (
    <div className="container py-5">
      <h3>Forgot Password</h3>
      {step === 'request' ? (
        <form onSubmit={sendOtp}>
          <input
            className="form-control mb-2"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <button className="btn btn-primary">Send OTP</button>
          {msg && <div className="alert alert-info mt-3">{msg}</div>}
        </form>
      ) : (
        <form onSubmit={verifyOtp}>
          <input
            className="form-control mb-2"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button className="btn btn-primary">Verify OTP</button>
          {msg && <div className="alert alert-info mt-3">{msg}</div>}
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
