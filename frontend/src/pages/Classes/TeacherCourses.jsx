import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api';

const TeacherCourses = () => {
  const { gradeId, subjectName, teacherId } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.get(`/teachers/${teacherId}`)
      .then(res => setTeacher(res.data.teacher))
      .catch(() => setTeacher(null));
  }, [teacherId]);

  useEffect(() => {
    if (!teacher) return;
    const name = `${teacher.firstName} ${teacher.lastName}`;
    let url = `/courses?grade=${gradeId}&teacherName=${encodeURIComponent(name)}`;
    if (subjectName) url += `&subject=${encodeURIComponent(subjectName)}`;
    api.get(url)
      .then(res => setCourses(res.data.courses || []))
      .catch(() => setCourses([]));
  }, [gradeId, subjectName, teacher]);

  if (!teacher) return <div className="container py-4">Loading...</div>;

  return (
    <div className="container py-4">
      <div className="hero mb-4">
        <h2 className="mb-2">
          {teacher.firstName} {teacher.lastName}
        </h2>
        {teacher.description && <p className="mb-0">{teacher.description}</p>}
      </div>
      <div className="row gy-4">
        {courses.map((c) => (
          <div className="col-md-4" key={c._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{c.title}</h5>
                {c.description && (
                  <p className="card-text flex-grow-1">{c.description}</p>
                )}
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Rs. {c.price}</span>
                  <Link to={`/class/${c._id}`} className="btn btn-primary btn-sm">
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherCourses;
