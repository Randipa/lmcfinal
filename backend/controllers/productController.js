const Product = require('../models/Product');
const User = require('../models/User');
const ShopOrder = require('../models/ShopOrder');
const crypto = require('crypto');

const generatePayHereHash = (merchantId, orderId, amount, currency, secret) => {
  const formattedAmount = parseFloat(amount).toFixed(2);
  const hashedSecret = crypto.createHash('md5').update(secret).digest('hex').toUpperCase();
  const hashString = merchantId + orderId + formattedAmount + currency + hashedSecret;
  return crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();
};

exports.createProduct = async (req, res) => {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${req.protocol}://${req.get('host')}`);
    const imageUrl = req.file
      ? `${baseUrl}/uploads/products/${req.file.filename}`
      : undefined;
    const product = new Product({ ...req.body, imageUrl });
    await product.save();
    res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `${req.protocol}://${req.get('host')}`);
    const updates = { ...req.body };
    if (req.file) {
      updates.imageUrl = `${baseUrl}/uploads/products/${req.file.filename}`;
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

exports.initiateCheckout = async (req, res) => {
  try {
    const { items, customer } = req.body; // customer details
    const userId = req.user?.userId;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided' });
    }
    if (!customer || !customer.firstName || !customer.lastName || !customer.phone || !customer.address) {
      return res.status(400).json({ message: 'Missing customer details' });
    }

    const productIds = items.map(i => i.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    let total = 0;
    const orderItems = [];
    products.forEach(p => {
      const cartItem = items.find(i => i.productId === p._id.toString());
      const qty = cartItem ? parseInt(cartItem.qty, 10) || 0 : 0;
      if (qty > 0) {
        total += qty * p.price;
        orderItems.push({ productId: p._id, qty, price: p.price });
      }
    });

    if (total <= 0) {
      return res.status(400).json({ message: 'Invalid total' });
    }

    const orderId = `SHOP${Date.now()}`;
    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    const currency = 'LKR';
    const amount = total.toFixed(2);
    const hash = generatePayHereHash(merchantId, orderId, amount, currency, merchantSecret);

    await ShopOrder.create({
      userId,
      orderId,
      items: orderItems,
      total: amount,
      customer,
      status: 'pending'
    });

    const baseUrl =
      process.env.BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000');

    const paymentData = {
      sandbox: process.env.PAYHERE_SANDBOX === 'true',
      merchant_id: merchantId,
      return_url: `${baseUrl}/api/payment/return`,
      cancel_url: `${baseUrl}/api/payment/cancel`,
      notify_url: `${baseUrl}/api/payment/notify`,
      order_id: orderId,
      items: 'Shop Order',
      amount,
      currency,
      hash,
      first_name: customer.firstName,
      last_name: customer.lastName,
      email: customer.email || `user${customer.phone}@example.com`,
      phone: customer.phone,
      address: customer.address,
      city: customer.city || 'Colombo',
      country: 'Sri Lanka'
    };

    res.json({ success: true, paymentData, orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Checkout failed' });
  }
};

exports.verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await ShopOrder.findOne({ orderId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.user.userRole !== 'admin' && order.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Verification failed' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await ShopOrder.find()
      .populate('userId', 'firstName lastName')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await ShopOrder.findByIdAndUpdate(
      req.params.id,
      { deliveryStatus: status },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update status' });
  }
};
