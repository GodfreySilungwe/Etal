const paymentReferenceModel = require('../models/paymentReferenceModel');

async function create(req, res) {
  try {
    const { customer_name, phone, method_used, transaction_reference, product_details } = req.body;
    if (!customer_name || !phone || !method_used || !transaction_reference || !product_details) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const created = await paymentReferenceModel.create({
      customer_name,
      phone,
      method_used,
      transaction_reference,
      product_details
    });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit payment reference' });
  }
}

async function list(req, res) {
  try {
    const items = await paymentReferenceModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list payment references' });
  }
}

async function updateStatus(req, res) {
  try {
    const status = String(req.body.service_status || '').toLowerCase();
    if (!['pending', 'complete'].includes(status)) {
      return res.status(400).json({ error: 'Invalid service_status' });
    }
    const updated = await paymentReferenceModel.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
}

module.exports = { create, list, updateStatus };
