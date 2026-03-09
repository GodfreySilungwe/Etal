const installationModel = require('../models/installationModel');

async function create(req, res) {
  try {
    const { customer_location, preferred_date, product } = req.body;
    if(!customer_location || !preferred_date || !product) return res.status(400).json({ error: 'Missing fields' });
    const created = await installationModel.create({ customer_location, preferred_date, product });
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

module.exports = { create, list };
