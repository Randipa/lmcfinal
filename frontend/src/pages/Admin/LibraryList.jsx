import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function LibraryList() {
  const [items, setItems] = useState([]);

  const load = () => {
    api
      .get('/library')
      .then(res => setItems(res.data.items || []))
      .catch(() => setItems([]));
  };

  useEffect(() => { load(); }, []);

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/library/${id}`);
      load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>E-Library</h2>
        <Link className="btn btn-success" to="/admin/library/upload">Add File</Link>
      </div>
      <ul className="list-group">
        {items.map(it => (
          <li key={it._id} className="list-group-item d-flex justify-content-between">
            <span>{it.title}</span>
            <span>
              <a className="btn btn-sm btn-outline-primary me-2" href={it.fileUrl} target="_blank" rel="noopener noreferrer">Download</a>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(it._id)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LibraryList;
