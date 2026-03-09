const { pool } = require('../dbInit');

async function list() {
  const res = await pool.query('SELECT * FROM testimonials ORDER BY created_at DESC');
  return res.rows;
}

async function create(data) {
  const { author, content } = data;
  const res = await pool.query('INSERT INTO testimonials(author, content) VALUES($1,$2) RETURNING *', [author || null, content]);
  return res.rows[0];
}

async function remove(id) {
  await pool.query('DELETE FROM testimonials WHERE id=$1', [id]);
}

module.exports = { list, create, remove };
