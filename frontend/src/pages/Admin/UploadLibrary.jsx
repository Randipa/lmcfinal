import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function UploadLibrary() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      if (file) fd.append('file', file);
      await api.post('/library', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Uploaded');
      navigate('/admin/library');
    } catch (err) {
      setMessage('Upload failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Upload Library File</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={submit} encType="multipart/form-data">
        <input
          className="form-control mb-2"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          type="file"
          className="form-control mb-2"
          onChange={(e) => setFile(e.target.files[0])}
          required
        />
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
}

export default UploadLibrary;
