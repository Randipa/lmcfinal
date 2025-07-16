import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function CreateAssistant() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    education: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    try {
      await api.post('/users', { ...form, userRole: 'assistant' });
      setMessage('Assistant created');
      navigate('/admin/assistants');
    } catch (err) {
      setMessage('Creation failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Assistant</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input className="form-control mb-2" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input className="form-control mb-2" name="phoneNumber" placeholder="Phone" value={form.phoneNumber} onChange={handleChange} required />
        <input className="form-control mb-2" type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        <input className="form-control mb-2" type="password" name="confirmPassword" placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange} required />
        <input className="form-control mb-2" name="education" placeholder="Education" value={form.education} onChange={handleChange} />
        <input className="form-control mb-2" name="address" placeholder="Address" value={form.address} onChange={handleChange} />
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

export default CreateAssistant;
