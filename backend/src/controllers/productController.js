const productModel = require('../models/productModel');

async function list(req, res) {
  try {
    const filters = { search: req.query.search, category_id: req.query.category_id };
    const items = await productModel.getAll(filters);
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list products' });
  }
}

async function get(req, res) {
  try {
    const item = await productModel.getById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get product' });
  }
}

async function create(req, res) {
  try {
    const created = await productModel.create(req.body);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create product' });
  }
}

async function update(req, res) {
  try {
    const updated = await productModel.update(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update product' });
  }
}

async function remove(req, res) {
  try {
    await productModel.remove(req.params.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

module.exports = { list, get, create, update, remove };
