import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function AllClasses() {
  const [classes, setClasses] = useState([]);

  useEffect(() => {
    api.get('/courses')
      .then(res => setClasses(res.data.courses || []))
      .catch(() => setClasses([]));
  }, []);

  return (
    <div className="container py-4">
      <div className="hero mb-4">
        <h2 className="mb-0">All Classes</h2>
      </div>
      <div className="row gy-4">
        {classes.map((cls) => (
          <div className="col-md-4" key={cls._id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{cls.title}</h5>
                {cls.description && (
                  <p className="card-text flex-grow-1">{cls.description}</p>
                )}
                <div className="mt-auto d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Rs. {cls.price}</span>
                  <Link to={`/class/${cls._id}`} className="btn btn-primary btn-sm">
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
}

export default AllClasses;
