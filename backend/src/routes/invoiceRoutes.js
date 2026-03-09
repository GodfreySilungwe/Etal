const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken } = require('../auth');

router.post('/', invoiceController.create);
router.get('/', authenticateToken, invoiceController.list);

module.exports = router;
