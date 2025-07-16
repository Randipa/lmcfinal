import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const loadCart = () => {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(cart.length);
    };
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.reload();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-sm">
      <div className="container">
        <Link className="navbar-brand text-white fw-bold" to="/">LMC</Link>
        <div className="ms-auto d-flex align-items-center">
          {cartCount > 0 && (
            <Link
              to="/shop/cart"
              className="btn btn-sm btn-light position-relative me-3"
            >
              🛒
              <span
                className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              >
                {cartCount}
              </span>
            </Link>
          )}
          {user ? (
            <button className="btn btn-sm btn-light text-primary" onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-light btn-sm me-2 text-primary">Login</Link>
              <Link to="/register" className="btn btn-outline-light btn-sm text-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
