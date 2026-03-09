const deliveryModel = require('../models/deliveryModel');

async function create(req, res) {
  try {
    const { delivery_address, phone, order_details } = req.body;
    if(!delivery_address || !phone || !order_details) return res.status(400).json({ error: 'Missing fields' });
    const created = await deliveryModel.create({ delivery_address, phone, order_details });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create delivery request' });
  }
}

async function list(req, res) {
  try {
    const items = await deliveryModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list delivery requests' });
  }
}

module.exports = { create, list };
