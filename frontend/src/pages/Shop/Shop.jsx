import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';
import './shop.css';

const Shop = () => {
  const [cart, setCart] = useState(() => {
    const existing = localStorage.getItem('cart');
    return existing ? JSON.parse(existing) : [];
  });
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get('/products')
      .then((res) => setItems(res.data.products || []))
      .catch(() => setItems([]));
  }, []);

  const addToCart = (item) => {
    if (item.quantity <= 0) {
      alert('Out of stock');
      return;
    }
    const newCart = [...cart, { ...item, qty: 1 }];
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-center">Shop Items</h3>
      <div className="row g-4">
        {items.map((item) => (
          <div className="col-12 col-sm-6 col-md-4 col-lg-3" key={item._id}>
            <div className="card h-100 shadow-sm shop-card">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  className="card-img-top shop-card-img"
                  alt={item.name}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text fw-semibold mb-3">Rs. {item.price}</p>
                <button
                  className="btn btn-primary mt-auto w-100"
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                >
                  {item.quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-4">
        <Link to="/shop/cart" className="btn btn-dark">
          Go to Cart
        </Link>
      </div>
    </div>
  );
};

export default Shop;
