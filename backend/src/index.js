const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { initDb } = require('./dbInit');
const productRoutes = require('./routes/productRoutes');
const authRoutes = require('./routes/authRoutes');
const { authenticateToken } = require('./auth');
const categoryModel = require('./models/categoryModel');
require('dotenv').config();

dotenv.config();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// ensure uploads directory exists and serve static files
const uploadsDir = path.join(__dirname, '..', 'uploads');
fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || '';
    cb(null, file.fieldname + '-' + unique + ext);
  }
});
const upload = multer({ storage });

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Mount MVC routes
app.use('/api/products', productRoutes);
app.use('/api/admin', authRoutes);
app.use('/api/invoice-requests', require('./routes/invoiceRoutes'));
app.use('/api/installation-requests', require('./routes/installationRoutes'));
app.use('/api/delivery-requests', require('./routes/deliveryRoutes'));
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/newsletter', require('./routes/newsletterRoutes'));

// Upload image (protected)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const relPath = `/uploads/${req.file.filename}`;
  res.json({ url: relPath });
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

// Initialize DB then start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database', err);
    process.exit(1);
  });
