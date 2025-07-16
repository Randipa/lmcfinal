import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

function InquiryDetail() {
  const { inquiryId } = useParams();
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState(null);

  const load = () => {
    api.get(`/inquiries/${inquiryId}`)
      .then(res => setInquiry(res.data.inquiry))
      .catch(() => navigate('/admin/inquiries'));
  };

  useEffect(() => {
    load();
  }, [inquiryId]);

  const approve = async () => {
    try {
      await api.put(`/inquiries/${inquiryId}/approve`);
      load();
    } catch {
      alert('Failed to approve');
    }
  };

  if (!inquiry) return null;

  return (
    <div className="container mt-4">
      <h2>Inquiry Details</h2>
      <ul className="list-group mb-3">
        <li className="list-group-item"><strong>Name:</strong> {inquiry.userId?.firstName || inquiry.firstName} {inquiry.userId?.lastName || inquiry.lastName}</li>
        <li className="list-group-item"><strong>Phone:</strong> {inquiry.phoneNumber}</li>
        <li className="list-group-item"><strong>Course:</strong> {inquiry.courseId?.title}</li>
        <li className="list-group-item"><strong>Status:</strong> {inquiry.status}</li>
        {inquiry.message && <li className="list-group-item"><strong>Message:</strong> {inquiry.message}</li>}
      </ul>
      {inquiry.status !== 'approved' && (
        <button className="btn btn-primary" onClick={approve}>Approve</button>
      )}
    </div>
  );
}

export default InquiryDetail;

