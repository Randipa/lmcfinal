import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

const TeacherDashboard = () => {
  const [courses, setCourses] = useState([]);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) return;
    api
      .get('/teachers/me/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
  }, [user]);

  if (!user) return <div className="container py-4">Please login</div>;

  return (
    <div className="container py-4">
      <h2>Teacher Dashboard</h2>
      <p>Welcome {user.firstName} {user.lastName}</p>
      <ul className="list-group">
        {courses.map(c => (
          <li key={c._id} className="list-group-item d-flex justify-content-between">
            <span>{c.title}</span>
            <div>
              <Link className="btn btn-sm btn-primary me-2" to={`/teacher/courses/${c._id}/upload`}>
                Manage Content
              </Link>
              <Link className="btn btn-sm btn-warning me-2" to={`/teacher/courses/${c._id}/assignments`}>Assignments</Link>
              <Link className="btn btn-sm btn-outline-primary me-2" to={`/teacher/courses/${c._id}/assignments/new`}>
                Add Assignment
              </Link>
              <Link className="btn btn-sm btn-success" to="/teacher/notices/new">
                Add Notice
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherDashboard;
