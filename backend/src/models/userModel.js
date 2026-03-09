const { pool } = require('../dbInit');

async function findByUsername(username) {
  const res = await pool.query('SELECT * FROM users WHERE username=$1 LIMIT 1', [username]);
  return res.rows[0];
}

module.exports = { findByUsername };
