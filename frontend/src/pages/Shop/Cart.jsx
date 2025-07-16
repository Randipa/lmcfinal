import { useEffect, useState } from 'react';
import './shop.css';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const cart = localStorage.getItem('cart');
    if (cart) setItems(JSON.parse(cart));
  }, []);

  const total = items.reduce((sum, item) => sum + item.price * (item.qty || 1), 0);

  const handleCheckout = () => {
    if (items.length === 0) return;
    navigate('/shop/checkout');
  };

  const clearCart = () => {
    localStorage.removeItem('cart');
    setItems([]);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Shopping Cart</h3>
      {items.length === 0 ? (
        <p className="text-center">No items in cart.</p>
      ) : (
        <>
          <ul className="list-group mb-3">
            {items.map((item, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <div>
                  {item.name} <span className="text-muted">x {item.qty || 1}</span>
                </div>
                <span className="fw-semibold">Rs. {item.price * (item.qty || 1)}</span>
              </li>
            ))}
          </ul>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Total:</h5>
            <h5 className="mb-0">Rs. {total}</h5>
          </div>
          <div className="d-flex flex-column flex-sm-row gap-2">
            <button className="btn btn-success flex-fill" onClick={handleCheckout}>
              Checkout
            </button>
            <button className="btn btn-outline-danger flex-fill" onClick={clearCart}>
              Clear Cart
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;
