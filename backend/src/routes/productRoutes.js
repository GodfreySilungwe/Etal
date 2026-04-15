const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../auth');
const multer = require('multer');

// Configure multer for memory storage (required for S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', productController.list);
router.get('/:id', productController.get);
router.post('/', authenticateToken, upload.single('image'), productController.create);
router.put('/:id', authenticateToken, upload.single('image'), productController.update);
router.delete('/:id', authenticateToken, productController.remove);

module.exports = router;
