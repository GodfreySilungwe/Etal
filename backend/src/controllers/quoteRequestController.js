const quoteRequestModel = require('../models/quoteRequestModel');

async function create(req, res) {
  try {
    const { customer_name, phone, email, details, product_details } = req.body;
    if (!customer_name || !phone) return res.status(400).json({ error: 'Missing fields' });
    const created = await quoteRequestModel.create({ customer_name, phone, email, details, product_details });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create quote request' });
  }
}

async function list(req, res) {
  try {
    const items = await quoteRequestModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list quote requests' });
  }
}

async function updateStatus(req, res) {
  try {
    const status = String(req.body.status || '').toLowerCase();
    if (!['pending', 'complete'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
    const updated = await quoteRequestModel.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update quote status' });
  }
}

module.exports = { create, list, updateStatus };
