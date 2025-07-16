import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../../api';

const CourseAssignments = () => {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api
      .get(`/courses/${courseId}`)
      .then(res => setCourse(res.data.course))
      .catch(() => setCourse(null));

    api
      .get(`/assignments/course/${courseId}`)
      .then(res => setAssignments(res.data.assignments || []))
      .catch(() => setAssignments([]));
  }, [courseId]);

  return (
    <div className="container py-4">
      <h4>Assignments{course ? ` – ${course.title}` : ''}</h4>
      <ul className="list-group">
        {assignments.map(a => (
          <li key={a._id} className="list-group-item d-flex justify-content-between">
            <span>{a.title}</span>
            <Link className="btn btn-sm btn-outline-secondary" to={`/assistant/assignments/${a._id}/submissions`}>
              View Submissions
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CourseAssignments;
