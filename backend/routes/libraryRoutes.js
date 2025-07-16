const express = require('express');
const router = express.Router();
const controller = require('../controllers/libraryController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const uploadLibrary = require('../middleware/uploadLibraryFile');

router.post('/library', authenticateToken, requireAdmin, uploadLibrary.single('file'), controller.createItem);
router.get('/library', controller.getItems);
router.get('/library/:id', controller.getItemById);
router.delete('/library/:id', authenticateToken, requireAdmin, controller.deleteItem);
router.put('/library/:id', authenticateToken, requireAdmin, uploadLibrary.single('file'), controller.updateItem);

module.exports = router;
