const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const uploadProductImage = require('../middleware/uploadProductImage');

router.post('/products', authenticateToken, requireAdmin, uploadProductImage.single('image'), productController.createProduct);
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.put('/products/:id', authenticateToken, requireAdmin, uploadProductImage.single('image'), productController.updateProduct);
router.delete('/products/:id', authenticateToken, requireAdmin, productController.deleteProduct);
router.post('/shop/checkout', authenticateToken, productController.initiateCheckout);
router.post('/shop/verify', authenticateToken, productController.verifyOrder);
router.get('/shop/orders', authenticateToken, requireAdmin, productController.getOrders);
router.put('/shop/orders/:id', authenticateToken, requireAdmin, productController.updateDeliveryStatus);

module.exports = router;
