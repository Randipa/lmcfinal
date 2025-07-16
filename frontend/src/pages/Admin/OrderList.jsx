import { useEffect, useState } from 'react';
import api from '../../api';

const OrderList = () => {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get('/shop/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]));
  }, []);

  const changeStatus = async (id, status) => {
    try {
      await api.put(`/shop/orders/${id}`, { status });
      setOrders(orders.map(o => o._id === id ? { ...o, deliveryStatus: status } : o));
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Orders</h2>
      <ul className="list-group">
        {orders.map(o => (
          <li key={o._id} className="list-group-item">
            <div className="fw-semibold">{o.customer?.firstName} {o.customer?.lastName}</div>
            <div>{o.customer?.address}</div>
            <div className="mb-2">Order Status: {o.status}</div>
            <div className="d-flex align-items-center">
              <span className="me-2">Delivery:</span>
              <select
                className="form-select form-select-sm w-auto"
                value={o.deliveryStatus || 'pending'}
                onChange={e => changeStatus(o._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default OrderList;
