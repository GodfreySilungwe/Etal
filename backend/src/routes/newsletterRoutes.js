const express = require('express');
const router = express.Router();
const newsletterController = require('../controllers/newsletterController');
const { authenticateToken } = require('../auth');

router.post('/', newsletterController.subscribe);
router.get('/', authenticateToken, newsletterController.list);

module.exports = router;
