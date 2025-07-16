import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';

const AssignmentSubmissions = () => {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [marks, setMarks] = useState({});

  useEffect(() => {
    api
      .get(`/assignments/${assignmentId}`)
      .then((res) => setAssignment(res.data.assignment))
      .catch(() => setAssignment(null));

    api
      .get(`/assignments/${assignmentId}/submissions`)
      .then((res) => setSubmissions(res.data.submissions || []))
      .catch(() => setSubmissions([]));
  }, [assignmentId]);

  const saveMarks = async (id) => {
    const mark = marks[id];
    await api.put(`/assignments/${assignmentId}/submissions/${id}/mark`, { marks: mark });
    setSubmissions((prev) => prev.map((s) => (s._id === id ? { ...s, marks: mark } : s)));
  };

  return (
    <div className="container py-4">
      <h4>Submissions{assignment ? ` – ${assignment.title}` : ''}</h4>
      <ul className="list-group">
        {submissions.map((s) => {
          const ext = s.fileUrl.split('.').pop().split(/[#?]/)[0];
          const fileName = `${s.studentId?.firstName || 'student'}-${s.studentId?.lastName || ''}-${assignmentId}.${ext}`;
          const studentCode = s.studentId?._id?.slice(-5);
          return (
            <li key={s._id} className="list-group-item d-flex justify-content-between align-items-center">
              <span>
                {s.studentId?.firstName} {s.studentId?.lastName}
                {studentCode && <small className="text-muted ms-1">({studentCode})</small>} – {s.originalName}
              </span>
              <div className="d-flex align-items-center">
                <a className="btn btn-sm btn-outline-secondary me-2" href={s.fileUrl} target="_blank" rel="noopener noreferrer">
                  View
                </a>
                <a className="btn btn-sm btn-primary me-2" href={s.fileUrl} download={fileName}>
                  Download
                </a>
                <input
                  type="number"
                  className="form-control form-control-sm me-2"
                  style={{ width: '80px' }}
                  value={marks[s._id] ?? s.marks ?? ''}
                  onChange={(e) => setMarks({ ...marks, [s._id]: e.target.value })}
                />
                <button className="btn btn-sm btn-success" onClick={() => saveMarks(s._id)}>
                  Save
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default AssignmentSubmissions;
