import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api';

function ProductList() {
  const [products, setProducts] = useState([]);

  const load = () => {
    api
      .get('/products')
      .then(res => setProducts(res.data.products || []))
      .catch(() => setProducts([]));
  };

  useEffect(() => { load(); }, []);

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      alert('Delete failed');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Products</h2>
        <Link className="btn btn-success" to="/admin/products/create">New Product</Link>
      </div>
      <ul className="list-group">
        {products.map(p => (
          <li key={p._id} className="list-group-item d-flex justify-content-between">
            <span>{p.name} - Rs. {p.price}</span>
            <span>
              <Link className="btn btn-sm btn-outline-primary me-2" to={`/admin/products/${p._id}/edit`}>Edit</Link>
              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(p._id)}>Delete</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProductList;
