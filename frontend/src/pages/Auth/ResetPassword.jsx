import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const phoneNumber = location.state?.phoneNumber || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    setMsg('');
    try {
      await api.post('/auth/reset-password', {
        phoneNumber,
        newPassword,
        confirmNewPassword,
      });
      setMsg('Password reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 1000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  return (
    <div className="container py-5">
      <h3>Reset Password</h3>
      <form onSubmit={handleReset}>
        <input
          className="form-control mb-2"
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <input
          className="form-control mb-2"
          type="password"
          placeholder="Confirm New Password"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
        />
        <button className="btn btn-success">Reset</button>
        {msg && <div className="alert alert-info mt-3">{msg}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
