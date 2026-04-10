const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const paymentReferenceController = require('../controllers/paymentReferenceController');

router.post('/', paymentReferenceController.create);
router.get('/', authenticateToken, paymentReferenceController.list);
router.patch('/:id/status', authenticateToken, paymentReferenceController.updateStatus);

module.exports = router;
