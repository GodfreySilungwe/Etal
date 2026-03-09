const newsletterModel = require('../models/newsletterModel');

async function subscribe(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'Invalid email' });
    const created = await newsletterModel.create(email);
    res.json({ success: true, created });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
}

async function list(req, res) {
  try {
    const items = await newsletterModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list subscribers' });
  }
}

module.exports = { subscribe, list };
