import { useEffect, useState } from 'react';
import api from '../../api';
import Tile from '../../components/Tile';

const GradeList = () => {
  const [grades, setGrades] = useState([]);

  useEffect(() => {
    api
      .get('/courses/available-grades')
      .then(res => setGrades(res.data.grades || []))
      .catch(() => setGrades([]));
  }, []);

  return (
    <div className="container py-4">
      <div className="hero">
        <h2 className="mb-0">Choose a Grade</h2>
      </div>
      <div className="row gy-4">
        {grades.map((g) => (
          <Tile
            key={g}
            title={`Grade ${g}`}
            icon="🎓"
            link={`/classes/${g}/subjects`}
          />
        ))}
      </div>
    </div>
  );
};

export default GradeList;
