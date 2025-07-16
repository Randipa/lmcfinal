import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api';

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { phoneNumber, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      setMsg('Login successful!');
      const role = res.data.user.userRole;
      if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else if (role === 'assistant') {
        navigate('/assistant/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setMsg('Login failed.');
    }
  };

  return (
    <div className="container py-5">
      <h3>Login</h3>
      <form onSubmit={handleLogin}>
        <input className="form-control mb-2" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        <input className="form-control mb-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="btn btn-primary">Login</button>
        <div className="mt-2">
          <Link to="/forgot-password">Forgot Password?</Link>
        </div>
        {msg && <div className="alert alert-info mt-3">{msg}</div>}
      </form>
    </div>
  );
};

export default Login;
