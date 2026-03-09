const invoiceModel = require('../models/invoiceModel');

async function create(req, res) {
  try {
    const { customer_name, phone, email, product_details } = req.body;
    if(!customer_name || !phone || !product_details) return res.status(400).json({ error: 'Missing fields' });
    const created = await invoiceModel.create({ customer_name, phone, email, product_details });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create invoice request' });
  }
}

async function list(req, res) {
  try {
    const items = await invoiceModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list invoice requests' });
  }
}

module.exports = { create, list };
