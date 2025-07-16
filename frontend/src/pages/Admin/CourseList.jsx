import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function CourseList() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get('/courses')
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
  }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Courses</h2>
        <Link className="btn btn-success" to="/admin/courses/create">New Course</Link>
      </div>
      <ul className="list-group">
        {courses.map(c => (
          <li key={c._id} className="list-group-item d-flex justify-content-between">
            <span>{c.title}</span>
            <Link className="btn btn-sm btn-outline-primary" to={`/admin/courses/${c._id}/upload`}>Add Video URL</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CourseList;
