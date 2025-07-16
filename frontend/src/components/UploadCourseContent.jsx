import React, { useEffect, useState } from 'react';
import api from '../api';

function UploadCourseContent({ courseId, onUpload, initialIsPublic = false }) {
  const [contents, setContents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    videoId: '',
    videoUrl: '',
    isPublic: initialIsPublic,
    visibleFrom: '',
    subtitles: [{ language: '', url: '' }]
  });
  const [showSubtitles, setShowSubtitles] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm((f) => ({ ...f, isPublic: initialIsPublic }));
  }, [initialIsPublic]);

  const isValidUrl = (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  // Load existing course content
  useEffect(() => {
    api
      .get(`/courses/${courseId}`)
      .then((res) => setContents(res.data.course?.courseContent || []))
      .catch(() => setContents([]));
  }, [courseId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubtitleChange = (index, field, value) => {
    const updated = [...form.subtitles];
    updated[index][field] = value;
    setForm({ ...form, subtitles: updated });
  };

  const addSubtitleField = () => {
    setForm({ ...form, subtitles: [...form.subtitles, { language: '', url: '' }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showSubtitles) {
        for (const sub of form.subtitles) {
          if (sub.url && !isValidUrl(sub.url)) {
            setMessage('Subtitle URL must be a valid link');
            return;
          }
        }
      }
      if (editingId) {
        await api.put(`/courses/${courseId}/content/${editingId}`, form);
        setMessage('Video updated.');
      } else {
        const res = await api.post(`/courses/${courseId}/content`, form);
        setMessage('Video metadata uploaded successfully.');
        const newItem = res.data.course.courseContent[res.data.course.courseContent.length - 1];
        if (onUpload) onUpload(newItem);
      }
      setForm({
        title: '',
        videoId: '',
        videoUrl: '',
        isPublic: initialIsPublic,
        visibleFrom: '',
        subtitles: [{ language: '', url: '' }]
      });
      setEditingId(null);
      const res = await api.get(`/courses/${courseId}`);
      setContents(res.data.course?.courseContent || []);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    }
  };

  const handleEdit = (content) => {
    setEditingId(content._id);
    setForm({
      title: content.title || '',
      videoId: content.videoId || '',
      videoUrl: content.videoUrl || '',
      isPublic: !!content.isPublic,
      visibleFrom: content.visibleFrom
        ? new Date(content.visibleFrom).toISOString().slice(0, 16)
        : '',
      subtitles: content.subtitles && content.subtitles.length > 0
        ? content.subtitles.map((s) => ({ language: s.language || '', url: s.url || '' }))
        : [{ language: '', url: '' }]
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.delete(`/courses/${courseId}/content/${id}`);
      const res = await api.get(`/courses/${courseId}`);
      setContents(res.data.course?.courseContent || []);
    } catch (err) {
      setMessage('Delete failed');
    }
  };

  const handleTogglePublic = async (id, current) => {
    try {
      await api.put(`/courses/${courseId}/content/${id}`, { isPublic: !current });
      const res = await api.get(`/courses/${courseId}`);
      setContents(res.data.course?.courseContent || []);
    } catch (err) {
      setMessage('Update failed');
    }
  };

  return (
    <div className="mt-5 border p-4 rounded">
      <h4>📤 Add Video by URL</h4>
      {message && <div className="alert alert-info">{message}</div>}
      {contents.length > 0 && (
        <ul className="list-group mb-3">
          {contents.map((c) => (
            <li key={c._id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>{c.title || c.videoId}</span>
              <div className="d-flex align-items-center">
                <div className="form-check form-switch me-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    role="switch"
                    checked={c.isPublic}
                    onChange={() => handleTogglePublic(c._id, c.isPublic)}
                  />
                </div>
                <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(c)}>
                  Edit
                </button>
                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(c._id)}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <form onSubmit={handleSubmit}>
        <input type="text" name="title" value={form.title} onChange={handleChange}
               className="form-control mb-2" placeholder="Video Title" />
        <input type="text" name="videoId" value={form.videoId} onChange={handleChange}
               className="form-control mb-2" placeholder="Bunny Video ID" />
        <input
          type="text"
          name="videoUrl"
          value={form.videoUrl}
          onChange={handleChange}
          className="form-control mb-2"
          placeholder="Video Embed URL (https://...)"
        />
        <input type="datetime-local" name="visibleFrom" value={form.visibleFrom} onChange={handleChange}
               className="form-control mb-2" />
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name="isPublic"
            id="isPublic"
            checked={form.isPublic}
            onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
          />
          <label className="form-check-label" htmlFor="isPublic">
            Allow access for unpaid students
          </label>
        </div>

        <div className="form-check form-switch mb-2">
          <input
            className="form-check-input"
            type="checkbox"
            id="toggleSubtitles"
            checked={showSubtitles}
            onChange={(e) => setShowSubtitles(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="toggleSubtitles">
            Show Subtitles
          </label>
        </div>

        {showSubtitles && (
          <>
            <h6>📝 Subtitles:</h6>
            {form.subtitles.map((sub, idx) => (
              <div className="mb-2" key={idx}>
                <input
                  type="text"
                  placeholder="Language"
                  className="form-control mb-1"
                  value={sub.language}
                  onChange={(e) =>
                    handleSubtitleChange(idx, 'language', e.target.value)
                  }
                />
                <input
                  type="text"
                  placeholder="Subtitle URL"
                  className="form-control"
                  value={sub.url}
                  onChange={(e) =>
                    handleSubtitleChange(idx, 'url', e.target.value)
                  }
                />
              </div>
            ))}
            <button
              type="button"
              className="btn btn-secondary mb-3"
              onClick={addSubtitleField}
            >
              + Add Subtitle
            </button>
          </>
        )}

        <button type="submit" className="btn btn-primary w-100">Save Video URL</button>
      </form>
    </div>
  );
}

export default UploadCourseContent;
