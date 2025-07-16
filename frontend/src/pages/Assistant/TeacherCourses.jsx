import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

const TeacherCourses = () => {
  const { teacherId } = useParams();
  const [courses, setCourses] = useState([]);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    api
      .get(`/teachers/${teacherId}`)
      .then(res => setTeacher(res.data.teacher))
      .catch(() => setTeacher(null));

    api
      .get(`/teachers/${teacherId}/courses`)
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
  }, [teacherId]);

  return (
    <div className="container py-4">
      <h4>
        {teacher ? `${teacher.firstName} ${teacher.lastName}'s Classes` : 'Classes'}
      </h4>
      <ul className="list-group">
        {courses.map(c => (
          <li key={c._id} className="list-group-item d-flex justify-content-between">
            <span>{c.title}</span>
            <Link className="btn btn-sm btn-outline-secondary" to={`/assistant/course/${c._id}/assignments`}>
              View Assignments
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherCourses;
