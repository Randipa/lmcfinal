import { useEffect, useState } from 'react';
import api from '../../api';

const ELibrary = () => {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);

  useEffect(() => {
    api
      .get('/library')
      .then(res => setItems(res.data.items || []))
      .catch(() => setItems([]));
  }, []);

  const openViewer = (item) => {
    setActive(item);
  };

  return (
    <div className="container py-4">
      <h4>E-Library</h4>
      <div className="row gy-4 mb-4">
        {items.map((res) => (
          <div key={res._id} className="col-md-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{res.title}</h5>
                {res.description && (
                  <p className="card-text flex-grow-1">{res.description}</p>
                )}
                <button
                  className="btn btn-primary btn-sm mt-auto"
                  onClick={() => openViewer(res)}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {active && (
        <div className="border p-3 bg-light">
          <h5 className="mb-3">Preview: {active.title}</h5>
          <p>{active.description}</p>
          {active.fileUrl.endsWith('.pdf') ? (
            <iframe
              src={active.fileUrl}
              width="100%"
              height="500px"
              title="Preview"
            />
          ) : (
            <a href={active.fileUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default ELibrary;
