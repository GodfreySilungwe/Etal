const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../auth');

router.get('/', productController.list);
router.get('/:id', productController.get);
router.post('/', authenticateToken, productController.create);
router.put('/:id', authenticateToken, productController.update);
router.delete('/:id', authenticateToken, productController.remove);

module.exports = router;
