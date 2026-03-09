const { pool } = require('../dbInit');

async function create(data) {
  const { delivery_address, phone, order_details } = data;
  const res = await pool.query(
    'INSERT INTO delivery_requests(delivery_address, phone, order_details) VALUES($1,$2,$3) RETURNING *',
    [delivery_address, phone, order_details]
  );
  return res.rows[0];
}

async function list() {
  const res = await pool.query('SELECT * FROM delivery_requests ORDER BY requested_at DESC');
  return res.rows;
}

module.exports = { create, list };
