import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api';

function EditProduct() {
  const { productId } = useParams();
  const [form, setForm] = useState({ name: '', price: '', quantity: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${productId}`)
      .then(res => setForm({
        name: res.data.product.name || '',
        price: res.data.product.price,
        quantity: res.data.product.quantity || ''
      }))
      .catch(() => navigate('/admin/products'));
  }, [productId, navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image' && files) {
      setFile(files[0]);
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', form.price);
      fd.append('quantity', form.quantity);
      if (file) fd.append('image', file);
      await api.put(`/products/${productId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Product updated');
      navigate('/admin/products');
    } catch (err) {
      setMessage('Update failed');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Product</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <input
          className="form-control mb-2"
          name="price"
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
        />
        <input
          className="form-control mb-2"
          name="quantity"
          type="number"
          placeholder="Quantity"
          value={form.quantity}
          onChange={handleChange}
        />
        <button className="btn btn-primary">Save</button>
      </form>
    </div>
  );
}

export default EditProduct;
