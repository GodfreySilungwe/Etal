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

    region: process.env.AWS_REGION || 'us-east-1'
  });


const s3 = new AWS.S3();

// Configure multer for memory storage (required for S3)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Helper function to upload to S3 or save locally
const uploadToS3 = async (file, key) => {

    // Production: upload to S3
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };
    return s3.upload(params).promise();
  
};

// CORS configuration for CloudFront
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:4000',
      'http://etalfrontendbusket.s3-website-us-east-1.amazonaws.com',
      process.env.FRONTEND_URL,
    ].filter(Boolean)

    if (allowedOrigins.includes(origin)) {
      return callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Serve static files from uploads folder
// app.use('/uploads', express.static('uploads')); // Removed for Lambda, all uploads to S3

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
    const url =  `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;

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
if (process.env.NODE_ENV !== 'development') {
  initDb()
    .then(() => {
      console.log('Database initialized successfully');
    })
    .catch((err) => {
      console.error('Failed to initialize database', err);
      process.exit(1);
    });
} else {
  console.log('Development mode: Skipping AWS database initialization');
}

// Start local development server if not in serverless environment
if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export Express app for Lambda
module.exports = app;

// Development mode mock responses
if (process.env.NODE_ENV === 'development') {
  // Mock products endpoint
  app.get('/api/products', (req, res) => {
    res.json([
      {
        id: '1',
        name: 'Sample Product',
        category_id: '1',
        description: 'This is a sample product for development',
        price: 100,
        image_url: 'http://localhost:4000/uploads/Log.png'
      }
    ]);
  });

  // Mock categories endpoint
  app.get('/api/categories', (req, res) => {
    res.json([
      { id: '1', name: 'Electronics' }
    ]);
  });

  // Mock admin login
  app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'adminpass') {
      // Simple JWT mock
      const token = 'dev-token-' + Date.now();
      res.json({ token, user: { role: 'admin' } });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  });
}
