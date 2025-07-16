import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function AssistantList() {
  const [assistants, setAssistants] = useState([]);

  const load = () => {
    api
      .get('/users/role/assistant')
      .then(res => setAssistants(res.data || []))
      .catch(() => setAssistants([]));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Assistants</h2>
        <Link className="btn btn-success" to="/admin/assistants/create">New Assistant</Link>
      </div>
      <ul className="list-group">
        {assistants.map(a => (
          <li key={a._id} className="list-group-item d-flex justify-content-between">
            <span>{a.firstName} {a.lastName} - {a.phoneNumber}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AssistantList;
