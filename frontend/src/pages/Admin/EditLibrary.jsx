import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

function EditLibrary() {
  const { itemId } = useParams();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'passpaper',
    grade: '',
    subject: ''
  });
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api
      .get(`/library/${itemId}`)
      .then(res => {
        setForm({
          title: res.data.item.title || '',
          description: res.data.item.description || '',
          category: res.data.item.category || 'passpaper',
          grade: res.data.item.grade || '',
          subject: res.data.item.subject || ''
        });
        if (res.data.item.category === 'video') {
          setVideoUrl(res.data.item.fileUrl || '');
        }
      })
      .catch(() => navigate('/admin/library'));
  }, [itemId, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'file' && files) {
      setFile(files[0]);
    } else if (name === 'videoUrl') {
      setVideoUrl(value);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      fd.append('grade', form.grade);
      fd.append('subject', form.subject);
      if (form.category === 'video') {
        fd.append('fileUrl', videoUrl);
      } else if (file) {
        fd.append('file', file);
      }
      await api.put(`/library/${itemId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Item updated');
      navigate('/admin/library');
    } catch (err) {
      setMessage('Update failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Library Item</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <input
          className="form-control mb-2"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <select
          className="form-control mb-2"
          name="category"
          value={form.category}
          onChange={handleChange}
          required
        >
          <option value="passpaper">Pass Paper</option>
          <option value="book">Book</option>
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>
        {form.category === 'passpaper' && (
          <>
            <input
              className="form-control mb-2"
              name="grade"
              placeholder="Grade"
              value={form.grade}
              onChange={handleChange}
            />
            <input
              className="form-control mb-2"
              name="subject"
              placeholder="Subject"
              value={form.subject}
              onChange={handleChange}
            />
          </>
        )}
        <textarea
          className="form-control mb-2"
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
        />
        {form.category === 'video' ? (
          <input
            className="form-control mb-2"
            name="videoUrl"
            placeholder="Video URL"
            value={videoUrl}
            onChange={handleChange}
            required
          />
        ) : (
          <input
            className="form-control mb-2"
            name="file"
            type="file"
            onChange={handleChange}
          />
        )}
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
}

export default EditLibrary;
