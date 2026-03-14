const { pool } = require('../dbInit');

async function getAll(filters = {}) {
  const clauses = [];
  const params = [];
  let idx = 1;
  if (filters.search) {
    clauses.push(`(p.name ILIKE $${idx} OR p.description ILIKE $${idx})`);
    params.push(`%${filters.search}%`);
    idx++;
  }
  if (filters.category_id) {
    clauses.push(`p.category_id = $${idx}`);
    params.push(filters.category_id);
    idx++;
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const sql = `SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id ${where} ORDER BY p.id`;
  const res = await pool.query(sql, params);
  return res.rows;
}

async function getById(id) {
  const res = await pool.query('SELECT p.*, c.name as category FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id=$1 LIMIT 1', [id]);
  return res.rows[0];
}

async function create(product) {
  const { name, category_id, description, price, original_price, discount_percent, stock, specs, image_url } = product;
  const res = await pool.query(
    'INSERT INTO products(name, category_id, description, price, original_price, discount_percent, stock, specs, image_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *',
    [name, category_id || null, description || null, price || null, original_price || null, discount_percent || 0, stock || 0, specs ? JSON.stringify(specs) : null, image_url || null]
  );
  return res.rows[0];
}

async function update(id, product) {
  const { name, category_id, description, price, original_price, discount_percent, stock, specs, image_url } = product;
  const res = await pool.query(
    'UPDATE products SET name=$1, category_id=$2, description=$3, price=$4, original_price=$5, discount_percent=$6, stock=$7, specs=$8, image_url=$9 WHERE id=$10 RETURNING *',
    [name, category_id || null, description || null, price || null, original_price || null, discount_percent || 0, stock || 0, specs ? JSON.stringify(specs) : null, image_url || null, id]
  );
  return res.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM products WHERE id=$1', [id]);
}

module.exports = { getAll, getById, create, update, remove };
