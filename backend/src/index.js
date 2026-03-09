const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { initDb, pool } = require('./dbInit');
const { generateToken, authenticateToken, comparePassword } = require('./auth');
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

// Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Admin: login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Missing credentials' });
  try {
    const result = await pool.query('SELECT id, username, password_hash, role FROM users WHERE username=$1 LIMIT 1', [username]);
    if (!result.rows[0]) return res.status(401).json({ error: 'Invalid credentials' });
    const user = result.rows[0];
    const ok = await comparePassword(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = generateToken({ id: user.id, username: user.username, role: user.role });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Protected product CRUD
app.post('/api/products', authenticateToken, async (req, res) => {
  const { name, category_id, description, price, specs, image_url } = req.body;
  if (!name) return res.status(400).json({ error: 'Missing product name' });
  try {
    const result = await pool.query(
      'INSERT INTO products(name, category_id, description, price, specs, image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
      [name, category_id || null, description || null, price || null, specs ? JSON.stringify(specs) : null, image_url || null]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Upload image (protected)
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const relPath = `/uploads/${req.file.filename}`;
  res.json({ url: relPath });
});

app.put('/api/products/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { name, category_id, description, price, specs, image_url } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products SET name=$1, category_id=$2, description=$3, price=$4, specs=$5, image_url=$6 WHERE id=$7 RETURNING *`,
      [name, category_id || null, description || null, price || null, specs ? JSON.stringify(specs) : null, image_url || null, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
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
    const categoryModel = require('./models/categoryModel');
    const { authenticateToken } = require('./auth');
    require('dotenv').config();

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
  try {
