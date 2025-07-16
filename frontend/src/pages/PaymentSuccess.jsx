import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    const orderId = searchParams.get('order');
    if (!orderId) {
      setMessage('No order id provided.');
      return;
    }

    const verify = async () => {
      try {
        if (orderId.startsWith('SHOP')) {
          await api.post('/shop/verify', { orderId });
          setMessage('Order received! Redirecting to shop...');
          setTimeout(() => navigate('/shop'), 1500);
        } else {
          await api.post('/payment/verify-payment', { orderId });
          setMessage('Payment verified! Redirecting to dashboard...');
          setTimeout(() => navigate('/dashboard'), 1500);
        }
      } catch (err) {
        setMessage('Payment verification failed.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="container py-4">
      <p>{message}</p>
    </div>
  );
};

export default PaymentSuccess;
