import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

function UploadLibrary() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('passpaper');
  const [grade, setGrade] = useState('');
  const [subject, setSubject] = useState('');
  const [file, setFile] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('category', category);
      fd.append('grade', grade);
      fd.append('subject', subject);
      if (category === 'video') {
        fd.append('fileUrl', videoUrl);
      } else if (file) {
        fd.append('file', file);
      }
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
        <select
          className="form-control mb-2"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="passpaper">Pass Paper</option>
          <option value="book">Book</option>
          <option value="document">Document</option>
          <option value="video">Video</option>
          <option value="other">Other</option>
        </select>
        {category === 'passpaper' && (
          <>
            <input
              className="form-control mb-2"
              placeholder="Grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
            />
            <input
              className="form-control mb-2"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </>
        )}
        <textarea
          className="form-control mb-2"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        {category === 'video' ? (
          <input
            className="form-control mb-2"
            placeholder="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            required
          />
        ) : (
          <input
            type="file"
            className="form-control mb-2"
            onChange={(e) => setFile(e.target.files[0])}
            required
          />
        )}
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
}

export default UploadLibrary;
