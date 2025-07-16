import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api';
import Tile from '../../components/Tile';

const TeacherList = () => {
  const { gradeId, subjectName } = useParams();
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    const query = `/teachers?grade=${gradeId}` + (subjectName ? `&subject=${encodeURIComponent(subjectName)}` : '');
    api
      .get(query)
      .then(res => setTeachers(res.data.teachers || []))
      .catch(() => setTeachers([]));
  }, [gradeId, subjectName]);

  return (
    <div className="container py-4">
      <div className="hero">
        <h2 className="mb-0">Select a Teacher</h2>
      </div>
      <div className="row gy-4">
        {teachers.map((t) => (
          <Tile
            key={t._id}
            title={`${t.firstName} ${t.lastName}`}
            icon="🧑‍🏫"
            link={`/classes/${gradeId}/subjects/${encodeURIComponent(
              subjectName || ''
            )}/teachers/${t._id}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherList;
