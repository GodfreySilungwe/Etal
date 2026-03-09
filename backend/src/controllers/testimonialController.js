const testimonialModel = require('../models/testimonialModel');

async function list(req, res) {
  try {
    const items = await testimonialModel.list();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
}

async function create(req, res) {
  try {
    const { author, content } = req.body;
    if(!content) return res.status(400).json({ error: 'Missing content' });
    const created = await testimonialModel.create({ author, content });
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
}

async function remove(req, res) {
  try {
    await testimonialModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
}

module.exports = { list, create, remove };
