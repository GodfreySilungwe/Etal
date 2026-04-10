const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../auth');
const serviceModel = require('../models/serviceModel');

router.get('/', async (req, res) => {
  try {
    const rows = await serviceModel.getAll();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list services' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const created = await serviceModel.create({ name, description, price });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const updated = await serviceModel.update(req.params.id, { name, description, price });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    await serviceModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

module.exports = router;
