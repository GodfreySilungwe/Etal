const express = require('express');
const router = express.Router();
const testimonialController = require('../controllers/testimonialController');
const { authenticateToken } = require('../auth');

router.get('/', testimonialController.list);
router.post('/', testimonialController.create);
router.delete('/:id', authenticateToken, testimonialController.remove);

module.exports = router;
