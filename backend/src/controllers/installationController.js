const installationModel = require('../models/installationModel');

async function create(req, res) {
  try {
    const { customer_name, phone, customer_location, preferred_date, product, product_id, product_price, payment_status } = req.body;
    if(!customer_name || !phone || !customer_location || !preferred_date || !product) return res.status(400).json({ error: 'Missing fields' });
    const created = await installationModel.create({ customer_name, phone, customer_location, preferred_date, product, product_id, product_price, payment_status });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create installation request' });
  }
}

async function list(req, res) {
  try {
    const items = await installationModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list installation requests' });
  }
}

async function updateStatus(req, res) {
  try {
    const status = String(req.body.status || '').toLowerCase();
    if (!['pending', 'complete'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    const updated = await installationModel.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update installation request status' });
  }
}

async function updatePaymentStatus(req, res) {
  try {
    const payment_status = String(req.body.payment_status || '').toLowerCase();
    if (!['pending', 'paid'].includes(payment_status)) {
      return res.status(400).json({ error: 'Invalid payment status' });
    }
    const updated = await installationModel.updatePaymentStatus(req.params.id, payment_status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
}

module.exports = { create, list, updateStatus, updatePaymentStatus };
