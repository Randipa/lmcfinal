import { useEffect, useState } from 'react';
import api from '../../api';

function BankPaymentRequests() {
  const [requests, setRequests] = useState([]);

  const loadRequests = () => {
    api.get('/bank-payment/requests')
      .then(res => setRequests(res.data.requests || []))
      .catch(() => setRequests([]));
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approve = async (id) => {
    try {
      await api.put(`/bank-payment/approve/${id}`);
      loadRequests();
    } catch (err) {
      console.error('Approve failed', err);
    }
  };

  const download = async (id) => {
    try {
      const res = await api.get(`/bank-payment/download/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'slip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Download failed', err);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Bank Payment Requests</h2>
      <ul className="list-group">
        {requests.map(r => (
          <li
            key={r._id}
            className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row"
          >
            <span className="mb-2 mb-md-0">
              {r.userId?.firstName} {r.userId?.lastName} - {r.courseId?.title}
            </span>
            <div className="d-flex gap-2 align-items-center">
              {r.slipUrl && (
                <>
                  <a
                    href={r.slipUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary"
                  >
                    View Slip
                  </a>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => download(r._id)}
                  >
                    Download
                  </button>
                </>
              )}
              <button
                className="btn btn-sm btn-success"
                onClick={() => approve(r._id)}
              >
                Approve
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default BankPaymentRequests;
