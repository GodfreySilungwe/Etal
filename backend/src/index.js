const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const AWS = require('aws-sdk');
const { initDb } = require('./dbInit');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./auth');
const categoryModel = require('./models/categoryModel');
require('dotenv').config();

dotenv.config();
const app = express();

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Configure multer for memory storage (required for S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload to S3
const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read'
  };
  return s3.upload(params).promise();
};

// CORS configuration for CloudFront
const corsOptions = {
  origin: [
    'http://localhost:5173', // For development
    process.env.FRONTEND_URL, // CloudFront distribution URL
  ].filter(Boolean), // Remove falsy values
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mount MVC routes
app.use('/api/products', productRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/invoice-requests', require('./routes/invoiceRoutes'));
app.use('/api/installation-requests', require('./routes/installationRoutes'));
app.use('/api/delivery-requests', require('./routes/deliveryRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/payment-references', require('./routes/paymentReferenceRoutes'));
app.use('/api/quote-requests', require('./routes/quoteRequestRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));

// Upload image (protected)
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = require('path').extname(req.file.originalname) || '';
    const key = `uploads/${req.file.fieldname}-${unique}${ext}`;

    const result = await uploadToS3(req.file, key);
    const url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

    res.json({ url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Categories endpoints are kept here using model
app.get('/api/categories', async (req, res) => {
  try {
    const cats = await categoryModel.getAll();
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

app.post('/api/categories', authenticateToken, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const c = await categoryModel.create(name);
    res.json(c);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

app.delete('/api/categories/:id', authenticateToken, async (req, res) => {
  try {
    await categoryModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// Initialize DB
initDb()
  .then(() => {
    console.log('Database initialized successfully');
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });

// Export for serverless deployment
module.exports = app;
