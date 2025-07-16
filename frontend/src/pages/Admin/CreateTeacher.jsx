import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function CreateTeacher() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    description: ''
  });
  const [classes, setClasses] = useState([{ grade: '', subject: '' }]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleClassChange = (index, field, value) => {
    const updated = classes.map((cls, i) =>
      i === index ? { ...cls, [field]: value } : cls
    );
    setClasses(updated);
  };

  const addClass = () => setClasses([...classes, { grade: '', subject: '' }]);
  const removeClass = (index) =>
    setClasses(classes.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, classes };
      if (classes[0]) {
        payload.grade = classes[0].grade;
        payload.subject = classes[0].subject;
      }
      await api.post('/teachers', payload);
      setMessage('Teacher created');
      navigate('/admin/teachers');
    } catch (err) {
      setMessage('Creation failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Teacher</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
        <input className="form-control mb-2" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
        <input className="form-control mb-2" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
        <input className="form-control mb-2" name="phoneNumber" placeholder="Phone" value={form.phoneNumber} onChange={handleChange} />

        {classes.map((cls, idx) => (
          <div key={idx} className="d-flex mb-2 align-items-center">
            <select
              className="form-control me-2"
              value={cls.grade}
              onChange={(e) => handleClassChange(idx, 'grade', e.target.value)}
              required
            >
              <option value="">Select Grade</option>
              {[...Array(13)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Grade {i + 1}
                </option>
              ))}
            </select>
            <input
              className="form-control me-2"
              placeholder="Subject"
              value={cls.subject}
              onChange={(e) => handleClassChange(idx, 'subject', e.target.value)}
              required
            />
            {classes.length > 1 && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeClass(idx)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="btn btn-secondary mb-2"
          onClick={addClass}
        >
          Add Class
        </button>
        <textarea className="form-control mb-2" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

export default CreateTeacher;
