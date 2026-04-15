const productModel = require('../models/productModel');
const AWS = require('aws-sdk');
const { randomUUID } = require('crypto');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1'
});

const s3 = new AWS.S3();

// Helper function to upload to S3
const uploadToS3 = async (file, key) => {
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  };
  return s3.upload(params).promise();
};

async function list(req, res) {
  console.log("in the pro controller")
  try {
    const filters = { search: req.query.search, category_id: req.query.category_id };
    const items = await productModel.getAll(filters);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list products' });
  }
}

async function get(req, res) {
  try {
    const item = await productModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

async function create(req, res) {
  try {
    let image_url = req.body.image_url || null;

    // If a file is uploaded, upload to S3
    if (req.file) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = require('path').extname(req.file.originalname) || '';
      const key = `products/${req.file.fieldname}-${unique}${ext}`;
      const result = await uploadToS3(req.file, key);
      image_url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const productData = {
      ...req.body,
      image_url
    };

    const created = await productModel.create(productData);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function update(req, res) {
  try {
    let image_url = req.body.image_url || null;

    // If a file is uploaded, upload to S3
    if (req.file) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = require('path').extname(req.file.originalname) || '';
      const key = `products/${req.file.fieldname}-${unique}${ext}`;
      const result = await uploadToS3(req.file, key);
      image_url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const productData = {
      ...req.body,
      image_url
    };

    const updated = await productModel.update(req.params.id, productData);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function remove(req, res) {
  try {
    await productModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

module.exports = { list, get, create, update, remove };
