import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Checkout = () => {
  const [items, setItems] = useState([]);
  const [customer, setCustomer] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: ''
  });
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) setItems(JSON.parse(cart));
    else navigate('/shop/cart');
  }, [navigate]);

  const handleChange = e => {
    const { name, value } = e.target;
    setCustomer(prev => ({ ...prev, [name]: value }));
  };

  const handlePay = async e => {
    e.preventDefault();
    try {
      const payloadItems = items.map(i => ({ productId: i._id, qty: i.qty || 1 }));
      const res = await api.post('/shop/checkout', { items: payloadItems, customer });
      const data = res.data.paymentData;
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.sandbox
        ? 'https://sandbox.payhere.lk/pay/checkout'
        : 'https://www.payhere.lk/pay/checkout';
      for (const key in data) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = data[key];
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
      form.remove();
    } catch (err) {
      setMsg('Checkout failed');
    }
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Checkout</h3>
      {msg && <p className="text-danger">{msg}</p>}
      <form onSubmit={handlePay} className="mx-auto" style={{ maxWidth: '500px' }}>
        <input className="form-control mb-2" name="firstName" placeholder="First name" required value={customer.firstName} onChange={handleChange} />
        <input className="form-control mb-2" name="lastName" placeholder="Last name" required value={customer.lastName} onChange={handleChange} />
        <input className="form-control mb-2" name="email" type="email" placeholder="Email" value={customer.email} onChange={handleChange} />
        <input className="form-control mb-2" name="phone" placeholder="Phone" required value={customer.phone} onChange={handleChange} />
        <input className="form-control mb-2" name="address" placeholder="Address" required value={customer.address} onChange={handleChange} />
        <input className="form-control mb-3" name="city" placeholder="City" value={customer.city} onChange={handleChange} />
        <button className="btn btn-success w-100">Pay</button>
      </form>
    </div>
  );
};

export default Checkout;
