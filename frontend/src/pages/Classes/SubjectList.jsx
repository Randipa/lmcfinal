import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../../api';
import Tile from '../../components/Tile';

const SubjectList = () => {
  const { gradeId } = useParams();
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api
      .get(`/teachers/available-subjects?grade=${gradeId}`)
      .then((res) => setSubjects(res.data.subjects || []))
      .catch(() => setSubjects([]));
  }, [gradeId]);

  return (
    <div className="container py-4">
      <div className="hero">
        <h2 className="mb-0">Select a Subject</h2>
      </div>
      <div className="row gy-4">
        {subjects.map((subject) => (
          <Tile
            key={subject}
            title={subject}
            icon="📘"
            link={`/classes/${gradeId}/subjects/${encodeURIComponent(subject)}/teachers`}
          />
        ))}
      </div>
    </div>
  );
};

export default SubjectList;
