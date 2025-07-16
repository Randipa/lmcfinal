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
      <ul className="list-group mb-4">
        {items.map((res) => (
          <li
            key={res._id}
            className="list-group-item d-flex justify-content-between"
          >
            {res.title}
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => openViewer(res)}
            >
              View
            </button>
          </li>
        ))}
      </ul>

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
