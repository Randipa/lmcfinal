import { useEffect, useState } from 'react';
import api from '../../api';

const ELibrary = () => {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState(null);
  const [category, setCategory] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!category) return;
    api
      .get('/library', { params: { category } })
      .then(res => setItems(res.data.items || []))
      .catch(() => setItems([]));
    setActive(null);
  }, [category]);

  const openViewer = (item) => {
    setActive(item);
  };

  const categories = [
    { key: 'passpaper', label: 'Pass Papers' },
    { key: 'book', label: 'Books' },
    { key: 'document', label: 'Documents' },
    { key: 'video', label: 'Videos' },
    { key: 'other', label: 'Others' }
  ];

  const filtered = items.filter(i =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container py-4">
      <h4>E-Library</h4>
      {!category ? (
        <div className="row gy-4 mb-4">
          {categories.map(c => (
            <div key={c.key} className="col-md-4">
              <div
                className="card h-100 shadow-sm text-center p-4"
                style={{ cursor: 'pointer' }}
                onClick={() => setCategory(c.key)}
              >
                <div className="card-body d-flex align-items-center justify-content-center">
                  <h5 className="card-title mb-0">{c.label}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <button className="btn btn-link mb-3" onClick={() => setCategory(null)}>
            &laquo; Back to categories
          </button>
          <input
            className="form-control mb-3"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="row gy-4 mb-4">
            {filtered.map((res) => (
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
        </>
      )}
    </div>
  );
};

export default ELibrary;
