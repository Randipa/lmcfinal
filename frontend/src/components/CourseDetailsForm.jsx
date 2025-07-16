import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function CourseDetailsForm({ courseId }) {
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

  // Load course details
  useEffect(() => {
    api.get(`/courses/${courseId}`)
      .then(res => {
        const c = res.data.course || {};
        setForm({
          title: c.title || '',
          description: c.description || '',
          price: c.price || '',
          durationInDays: c.durationInDays || 30,
          grade: c.grade || '',
          subject: c.subject || '',
          teacherName: c.teacherName || ''
        });
      })
      .catch(() => setMessage('Failed to load course'));
  }, [courseId]);

  // Load subjects when grade changes
  useEffect(() => {
    if (!form.grade) {
      setTeachers([]);
      setSubjects([]);
      return;
    }
    api
      .get(`/teachers/available-subjects?grade=${form.grade}`)
      .then(res => setSubjects(res.data.subjects || []))
      .catch(() => setSubjects([]));
  }, [form.grade]);

  // Load teachers when subject changes
  useEffect(() => {
    if (!form.grade || !form.subject) {
      setTeachers([]);
      return;
    }
    api
      .get(`/teachers?grade=${form.grade}&subject=${encodeURIComponent(form.subject)}`)
      .then(res => setTeachers(res.data.teachers || []))
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
      await api.put(`/courses/${courseId}`, form);
      setMessage('Course updated');
    } catch (err) {
      setMessage('Update failed');
    }
  };

  const deleteCourse = async () => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      navigate('/admin/courses');
    } catch (err) {
      setMessage('Delete failed');
    }
  };

  return (
    <div className="border p-4 rounded mb-4">
      <h4>Edit Course</h4>
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
          {subjects.map(s => (
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
          {teachers.map(t => (
            <option key={t._id} value={`${t.firstName} ${t.lastName}`}>
              {t.firstName} {t.lastName}
            </option>
          ))}
        </select>
        <div className="d-flex justify-content-between">
          <button className="btn btn-primary" type="submit">Save</button>
          <button type="button" onClick={deleteCourse} className="btn btn-danger">Delete</button>
        </div>
      </form>
    </div>
  );
}

export default CourseDetailsForm;
