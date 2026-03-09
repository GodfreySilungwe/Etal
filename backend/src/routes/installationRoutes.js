const express = require('express');
const router = express.Router();
const installationController = require('../controllers/installationController');
const { authenticateToken } = require('../auth');

router.post('/', installationController.create);
router.get('/', authenticateToken, installationController.list);

module.exports = router;
