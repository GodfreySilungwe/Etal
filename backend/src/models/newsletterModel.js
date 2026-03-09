const { pool } = require('../dbInit');

async function create(email) {
  const res = await pool.query('INSERT INTO newsletter_subscribers(email) VALUES($1) ON CONFLICT DO NOTHING RETURNING *', [email]);
  return res.rows[0];
}

async function list() {
  const res = await pool.query('SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC');
  return res.rows;
}

module.exports = { create, list };
