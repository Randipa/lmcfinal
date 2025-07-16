import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const AssistantDashboard = () => {
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api
      .get('/teachers')
      .then(res => setTeachers(res.data.teachers || []))
      .catch(() => setTeachers([]));
  }, []);

  return (
    <div className="container py-4">
      <h2>Select Teacher</h2>
      <ul className="list-group">
        {teachers.map(t => (
          <li key={t._id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>{t.firstName} {t.lastName}</span>
            <Link className="btn btn-sm btn-primary" to={`/assistant/teacher/${t._id}/courses`}>
              View Classes
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AssistantDashboard;
