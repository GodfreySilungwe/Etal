const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticateToken } = require('../auth');
const multer = require('multer');

// Configure multer for memory storage (required for S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.get('/', serviceController.list);
router.get('/:id', serviceController.get);
router.post('/', authenticateToken, upload.single('image'), serviceController.create);
router.put('/:id', authenticateToken, upload.single('image'), serviceController.update);
router.delete('/:id', authenticateToken, serviceController.remove);

module.exports = router;

module.exports = router;
