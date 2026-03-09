const { pool } = require('../dbInit');

async function create(data) {
  const { customer_name, phone, email, product_details } = data;
  const res = await pool.query(
    'INSERT INTO invoice_requests(customer_name, phone, email, product_details) VALUES($1,$2,$3,$4) RETURNING *',
    [customer_name, phone, email || null, product_details || null]
  );
  return res.rows[0];
}

async function list() {
  const res = await pool.query('SELECT * FROM invoice_requests ORDER BY requested_at DESC');
  return res.rows;
}

module.exports = { create, list };
