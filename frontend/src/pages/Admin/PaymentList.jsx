import { useEffect, useState } from 'react';
import api from '../../api';

function PaymentList() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get('/payment/all')
      .then(res => setPayments(res.data.payments || []))
      .catch(() => setPayments([]));
  }, []);

  const approvePayment = async (orderId) => {
    if (!window.confirm('Approve this payment?')) return;
    try {
      await api.post(`/payment/approve/${orderId}`);
      setPayments(payments.map(p => p.orderId === orderId ? { ...p, status: 'completed' } : p));
    } catch (err) {
      alert('Failed to approve payment');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Payments</h2>
      <ul className="list-group">
        {payments.map(p => (
          <li key={p._id} className="list-group-item d-flex justify-content-between">
            <span>
              {p.userId?.firstName} {p.userId?.lastName} - {p.courseId?.title}
            </span>
            <span>
              {p.status}
              {p.status !== 'completed' && (
                <button className="btn btn-sm btn-primary ms-2" onClick={() => approvePayment(p.orderId)}>Approve</button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PaymentList;
