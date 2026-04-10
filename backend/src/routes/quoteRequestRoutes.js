const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const controller = require('../controllers/quoteRequestController');

router.post('/', controller.create);
router.get('/', authenticateToken, controller.list);
router.patch('/:id/status', authenticateToken, controller.updateStatus);

module.exports = router;
