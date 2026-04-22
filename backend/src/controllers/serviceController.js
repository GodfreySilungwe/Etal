const serviceModel = require('../models/serviceModel');
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
  try {
    const items = await serviceModel.getAll();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list services' });
  }
}

async function get(req, res) {
  try {
    const item = await serviceModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get service' });
  }
}

async function create(req, res) {
  try {
    let image_url = req.body.image_url || null;

    // If a file is uploaded, upload to S3
    if (req.file) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = require('path').extname(req.file.originalname) || '';
      const key = `services/${req.file.fieldname}-${unique}${ext}`;
      const result = await uploadToS3(req.file, key);
      image_url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const serviceData = {
      ...req.body,
      image_url
    };

    const created = await serviceModel.create(serviceData);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
  }
}

async function update(req, res) {
  try {
    let image_url = req.body.image_url || null;

    // If a file is uploaded, upload to S3
    if (req.file) {
      const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = require('path').extname(req.file.originalname) || '';
      const key = `services/${req.file.fieldname}-${unique}${ext}`;
      const result = await uploadToS3(req.file, key);
      image_url = `https://${process.env.S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
    }

    const serviceData = {
      ...req.body,
      image_url
    };

    const updated = await serviceModel.update(req.params.id, serviceData);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
}

async function remove(req, res) {
  try {
    await serviceModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
}

module.exports = {
  list,
  get,
  create,
  update,
  remove
};