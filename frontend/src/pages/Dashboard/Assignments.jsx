import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../api';

const Assignments = () => {
  const { classId } = useParams();
  const [file, setFile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get(`/assignments/course/${classId}`);
        const list = res.data.assignments || [];
        setAssignments(list);

        const subs = {};
        await Promise.all(
          list.map(async (a) => {
            try {
              const s = await api
                .get(`/assignments/${a._id}/submissions/mine`)
                .then((r) => r.data.submission);
              subs[a._id] = s;
            } catch {
              // ignore if no submission
            }
          })
        );
        setSubmissions(subs);
      } catch {
        setAssignments([]);
        setSubmissions({});
      }
    };
    load();
  }, [classId]);

  const handleUpload = async (e, assignmentId) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/assignments/${assignmentId}/submissions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    const submission = res.data.submission;
    setSubmissions((prev) => ({ ...prev, [assignmentId]: submission }));
    alert('Answer uploaded.');
  };

  return (
    <div className="container py-4">
      <h4>Assignments – {classId}</h4>
      <ul className="list-group mb-4">
        {assignments.map((a) => {
          const sub = submissions[a._id];
          return (
            <li key={a._id} className="list-group-item">
              <strong>{a.title}</strong>
              {a.description && <p className="mb-1">{a.description}</p>}
              {a.fileUrl && (
                <a
                  href={a.fileUrl}
                  className="d-block"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Assignment
                </a>
              )}
              {sub && (
                <div className="mt-2">
                  <a href={sub.fileUrl} className="d-block" target="_blank" rel="noopener noreferrer">
                    View My Submission
                  </a>
                  {sub.marks !== undefined && (
                    <span className="badge bg-success">Marks: {sub.marks}</span>
                  )}
                </div>
              )}
              {!sub && (
                <form onSubmit={(e) => handleUpload(e, a._id)} className="mt-2">
                  <input
                    type="file"
                    className="form-control mb-2"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <button className="btn btn-warning btn-sm">Upload Answer</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Assignments;
