const { pool } = require('../dbInit');

async function getAll() {
  const res = await pool.query('SELECT * FROM categories ORDER BY name');
  return res.rows;
}

async function create(name) {
  const res = await pool.query('INSERT INTO categories(name) VALUES($1) RETURNING *', [name]);
  return res.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id=$1', [id]);
}

module.exports = { getAll, create, remove };
