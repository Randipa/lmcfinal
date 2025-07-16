import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Tile from '../../components/Tile';
import './dashboard.css';

const ClassDashboard = () => {
  const { classId } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    api.get(`/courses/${classId}`)
      .then(res => setCourse(res.data.course))
      .catch(() => setCourse(null));
  }, [classId]);

  return (
    <div className="container py-5">
      <div className="hero dashboard-hero mb-4">
        <h2 className="mb-3">{course ? course.title : 'Class'}</h2>
        {course?.description && (
          <p className="mb-0">{course.description}</p>
        )}
      </div>
      <div className="text-center mb-4">
        <h4 className="fw-semibold">Class Links</h4>
      </div>
      <div className="row gy-4 dashboard-tiles">
        <Tile title="Recordings" icon="🎥" link={`/dashboard/recordings/${classId}`} />
        <Tile title="Assignments" icon="📝" link={`/dashboard/assignments/${classId}`} />
        <Tile title="Marks" icon="📊" link={`/dashboard/marks/${classId}`} />
        <Tile title="Notices" icon="📢" link="/dashboard/notices" />
      </div>
    </div>
  );
};

export default ClassDashboard;
