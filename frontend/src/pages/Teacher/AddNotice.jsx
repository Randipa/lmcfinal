import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const AddNotice = () => {
  const [form, setForm] = useState({ title: '', message: '', courseId: '' });
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get('/teachers/me/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submit = async e => {
    e.preventDefault();
    try {
      await api.post('/notices', form);
      setMessage('Notice created');
      navigate('/teacher/dashboard');
    } catch (err) {
      setMessage('Creation failed');
    }
  };

  return (
    <div className="container py-4">
      <h4>Add Notice</h4>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={submit}>
        <input
          className="form-control mb-2"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          className="form-control mb-2"
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <select
          className="form-control mb-2"
          name="courseId"
          value={form.courseId}
          onChange={handleChange}
        >
          <option value="">Select Course (optional)</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
};

export default AddNotice;
