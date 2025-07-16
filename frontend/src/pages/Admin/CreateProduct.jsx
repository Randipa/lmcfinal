import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const CreateProduct = () => {
  const [form, setForm] = useState({ name: '', price: '', quantity: '' });
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

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
      await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMessage('Product added!');
      setTimeout(() => navigate('/admin/products/create'), 1000);
    } catch (err) {
      setMessage('Failed to add product');
    }
  };

  return (
    <div className="container mt-4">
      <h2>Create Product</h2>
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
        <button className="btn btn-primary">Add</button>
      </form>
    </div>
  );
};

export default CreateProduct;
