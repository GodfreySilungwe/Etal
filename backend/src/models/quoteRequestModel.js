const { pool } = require('../dbInit');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS quote_requests (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      details TEXT,
      product_details TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TIMESTAMP DEFAULT now()
    );
  `);
}

async function create(data) {
  await ensureTable();
  const { customer_name, phone, email, details, product_details } = data;
  const res = await pool.query(
    `INSERT INTO quote_requests(customer_name, phone, email, details, product_details)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [customer_name, phone, email || null, details || null, product_details || null]
  );
  return res.rows[0];
}

async function list() {
  await ensureTable();
  const res = await pool.query('SELECT * FROM quote_requests ORDER BY requested_at DESC');
  return res.rows;
}

async function updateStatus(id, status) {
  await ensureTable();
  const res = await pool.query('UPDATE quote_requests SET status=$1 WHERE id=$2 RETURNING *', [status, id]);
  return res.rows[0];
}

module.exports = { create, list, updateStatus };
