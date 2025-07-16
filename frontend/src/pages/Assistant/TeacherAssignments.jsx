import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';

const TeacherAssignments = () => {
  const { teacherId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [teacher, setTeacher] = useState(null);

  useEffect(() => {
    api
      .get(`/teachers/${teacherId}`)
      .then(res => setTeacher(res.data.teacher))
      .catch(() => setTeacher(null));

    api
      .get(`/assignments/teacher/${teacherId}`)
      .then(res => setAssignments(res.data.assignments || []))
      .catch(() => setAssignments([]));
  }, [teacherId]);

  return (
    <div className="container py-4">
      <h4>
        Assignments {teacher ? `– ${teacher.firstName} ${teacher.lastName}` : ''}
      </h4>
      <ul className="list-group">
        {assignments.map(a => (
          <li key={a._id} className="list-group-item d-flex justify-content-between">
            <span>
              {a.title}
              {a.courseId?.title && (
                <small className="text-muted ms-2">({a.courseId.title})</small>
              )}
            </span>
            <Link className="btn btn-sm btn-outline-secondary" to={`/assistant/assignments/${a._id}/submissions`}>
              View Submissions
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TeacherAssignments;
