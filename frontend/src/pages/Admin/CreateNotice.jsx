import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function CreateNotice() {
  const [form, setForm] = useState({
    title: '',
    message: '',
    courseId: '',
    teacherId: ''
  });
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
    api.get('/teachers')
      .then(res => setTeachers(res.data.teachers || []))
      .catch(() => setTeachers([]));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/notices', form);
      setMessage('Notice created');
      navigate('/admin/notices');
    } catch (err) {
      setMessage('Creation failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Notice</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
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
          <option value="">Select Class (optional)</option>
          {courses.map(c => (
            <option key={c._id} value={c._id}>{c.title}</option>
          ))}
        </select>
        <select
          className="form-control mb-2"
          name="teacherId"
          value={form.teacherId}
          onChange={handleChange}
        >
          <option value="">Select Teacher (optional)</option>
          {teachers.map(t => (
            <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>
          ))}
        </select>
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

export default CreateNotice;
