const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderId: { type: String, required: true, unique: true },
  paymentId: { type: String, default: null },
  items: [itemSchema],
  total: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'paid', 'cancelled', 'failed'], default: 'pending' },
  deliveryStatus: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' },
  customer: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String,
    city: String
  }
}, { timestamps: true });

module.exports = mongoose.model('ShopOrder', orderSchema);
