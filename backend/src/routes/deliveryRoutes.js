const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');
const { authenticateToken } = require('../auth');

router.post('/', deliveryController.create);
router.get('/', authenticateToken, deliveryController.list);

module.exports = router;
