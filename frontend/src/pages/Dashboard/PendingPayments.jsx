import { useEffect, useState } from 'react';
import api from '../../api';

const PendingPayments = () => {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    api.get('/inquiries/my')
      .then(res => setInquiries(res.data.inquiries || []))
      .catch(() => setInquiries([]));
  }, []);

  const payOnline = async (courseId, price) => {
    try {
      const res = await api.post('/payment/initiate-payment', {
        courseId,
        amount: price,
        phoneNumber: JSON.parse(localStorage.getItem('user') || '{}').phoneNumber
      });
      const data = res.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST';
        form.action = data.sandbox
          ? 'https://sandbox.payhere.lk/pay/checkout'
          : 'https://www.payhere.lk/pay/checkout';
      Object.entries(data).forEach(([k, v]) => {
        if (k === 'sandbox') return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to start payment');
    }
  };

  const payBank = async (courseId) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      try {
        const form = new FormData();
        form.append('courseId', courseId);
        form.append('slip', file);
        await api.post('/bank-payment/submit', form);
        alert('Bank payment submitted for review');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to submit bank payment');
      }
    };
    input.click();
  };

  return (
    <div className="container mt-4">
      <h2>Pending Payments</h2>
      {inquiries.filter(i => i.status === 'approved').length === 0 ? (
        <p>No pending payments</p>
      ) : (
        <ul className="list-group">
          {inquiries.filter(i => i.status === 'approved').map(i => (
            <li key={i._id} className="list-group-item d-flex justify-content-between align-items-center flex-column flex-md-row">
              <span className="mb-2 mb-md-0">{i.courseId?.title}</span>
              <div className="d-flex gap-2">
                <button className="btn btn-sm btn-primary" onClick={() => payOnline(i.courseId._id, i.courseId.price)}>
                  Pay Online
                </button>
                <button className="btn btn-sm btn-secondary" onClick={() => payBank(i.courseId._id)}>
                  Bank Deposit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PendingPayments;
