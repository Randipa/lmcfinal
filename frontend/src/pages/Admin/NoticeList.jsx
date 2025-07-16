import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function NoticeList() {
  const [notices, setNotices] = useState([]);

  const load = () => {
    api.get('/notices')
      .then(res => setNotices(res.data.notices || []))
      .catch(() => setNotices([]));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Notices</h2>
        <Link className="btn btn-success" to="/admin/notices/create">New Notice</Link>
      </div>
      <ul className="list-group">
        {notices.map(n => (
          <li key={n._id} className="list-group-item">
            <strong>{n.title}</strong>
            <p className="mb-0">{n.message}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NoticeList;
