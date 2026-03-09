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
  const { name, category_id, description, price, specs, image_url } = product;
  const res = await pool.query(
    'INSERT INTO products(name, category_id, description, price, specs, image_url) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',
    [name, category_id || null, description || null, price || null, specs ? JSON.stringify(specs) : null, image_url || null]
  );
  return res.rows[0];
}

async function update(id, product) {
  const { name, category_id, description, price, specs, image_url } = product;
  const res = await pool.query(
    'UPDATE products SET name=$1, category_id=$2, description=$3, price=$4, specs=$5, image_url=$6 WHERE id=$7 RETURNING *',
    [name, category_id || null, description || null, price || null, specs ? JSON.stringify(specs) : null, image_url || null, id]
  );
  return res.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM products WHERE id=$1', [id]);
}

module.exports = { getAll, getById, create, update, remove };
