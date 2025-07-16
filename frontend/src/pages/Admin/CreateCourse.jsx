import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function CreateCourse() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    durationInDays: 30,
    grade: '',
    subject: '',
    teacherName: ''
  });
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!form.grade) {
      setTeachers([]);
      setSubjects([]);
      return;
    }
    api
      .get(`/teachers/available-subjects?grade=${form.grade}`)
      .then((res) => setSubjects(res.data.subjects || []))
      .catch(() => setSubjects([]));
  }, [form.grade]);

  useEffect(() => {
    if (!form.grade || !form.subject) {
      setTeachers([]);
      return;
    }
    api
      .get(`/teachers?grade=${form.grade}&subject=${encodeURIComponent(form.subject)}`)
      .then((res) => setTeachers(res.data.teachers || []))
      .catch(() => setTeachers([]));
  }, [form.grade, form.subject]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'grade') {
      setForm({ ...form, grade: value, subject: '', teacherName: '' });
    } else if (name === 'subject') {
      setForm({ ...form, subject: value, teacherName: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/courses', form);
      setMessage('Course created!');
      navigate(`/admin/courses/${res.data.course._id}/upload`);
    } catch (err) {
      setMessage('Creation failed.');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Course</h2>
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
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="durationInDays"
          type="number"
          placeholder="Duration in days"
          value={form.durationInDays}
          onChange={handleChange}
        />
        <select
          className="form-control mb-2"
          name="grade"
          value={form.grade}
          onChange={handleChange}
          required
        >
          <option value="">Select Grade</option>
          {[...Array(13)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Grade {i + 1}</option>
          ))}
        </select>
        <select
          className="form-control mb-2"
          name="subject"
          value={form.subject}
          onChange={handleChange}
          required
        >
          <option value="">Select Subject</option>
          {subjects.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="form-control mb-2"
          name="teacherName"
          value={form.teacherName}
          onChange={handleChange}
          required
        >
          <option value="">Select Teacher</option>
          {teachers.map((t) => (
            <option key={t._id} value={`${t.firstName} ${t.lastName}`}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <button className="btn btn-primary">Create</button>
      </form>
    </div>
  );
}

export default CreateCourse;
