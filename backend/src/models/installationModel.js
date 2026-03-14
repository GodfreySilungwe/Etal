const { pool } = require('../dbInit');

async function create(data) {
  const { customer_location, preferred_date, product, product_id, product_price } = data;
  const res = await pool.query(
    'INSERT INTO installation_requests(customer_location, preferred_date, product, product_id, product_price) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [customer_location, preferred_date, product, product_id || null, product_price || null]
  );
  return res.rows[0];
}

async function list() {
  const res = await pool.query('SELECT * FROM installation_requests ORDER BY requested_at DESC');
  return res.rows;
}

module.exports = { create, list };
