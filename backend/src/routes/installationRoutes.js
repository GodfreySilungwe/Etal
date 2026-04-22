const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationController');
const { authenticateToken } = require('../auth');

router.post('/', installationController.create);
router.get('/', authenticateToken, installationController.list);
router.patch('/:id/status', authenticateToken, installationController.updateStatus);
router.patch('/:id/payment-status', authenticateToken, installationController.updatePaymentStatus);

module.exports = router;
