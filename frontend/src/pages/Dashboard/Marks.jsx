import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
// Previously this page displayed a bar chart using Chart.js. The requirements
// now specify showing only the numeric marks without any chart, so all chart
// related imports and code have been removed.
import api from '../../api';

const Marks = () => {
  const { classId } = useParams();
  const [labels, setLabels] = useState([]);
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    const load = async () => {
      const res = await api.get(`/assignments/course/${classId}`);
      const assignments = res.data.assignments || [];
      const submissions = await Promise.all(
        assignments.map((a) =>
          api
            .get(`/assignments/${a._id}/submissions/mine`)
            .then((r) => r.data.submission)
            .catch(() => null)
        )
      );
      setLabels(assignments.map((a) => a.title));
      setMarks(
        submissions.map((s) => {
          if (!s) return 0;
          const m = s.marks ?? 0;
          return Number(m) || 0;
        })
      );
    };
    load();
  }, [classId]);

  return (
    <div className="container py-4">
      <h4>Marks – {classId}</h4>
      {/* The bar chart was removed to simplify the interface */}
      <table className="table table-striped mt-4">
        <thead>
          <tr>
            <th>Assignment</th>
            <th>Marks</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, idx) => (
            <tr key={label}>
              <td>{label}</td>
              <td>{marks[idx]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Marks;
