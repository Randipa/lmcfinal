import { useEffect, useState } from 'react';
import api from '../../api';

function InquiryList() {
  const [inquiries, setInquiries] = useState([]);

  const load = () => {
    api.get('/inquiries')
      .then(res => setInquiries(res.data.inquiries || []))
      .catch(() => setInquiries([]));
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    try {
      await api.put(`/inquiries/${id}/approve`);
      load();
    } catch {
      alert('Failed to approve');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Payment Inquiries</h2>
      <ul className="list-group">
        {inquiries.map(i => (
          <li key={i._id} className="list-group-item d-flex justify-content-between align-items-center">
            <span>
              {i.userId?.firstName || i.firstName} {i.userId?.lastName || i.lastName} - {i.phoneNumber} - {i.courseId?.title}
            </span>
            {i.status === 'approved' ? (
              <span className="badge bg-success">Approved</span>
            ) : (
              <button className="btn btn-sm btn-primary" onClick={() => approve(i._id)}>Approve</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InquiryList;
