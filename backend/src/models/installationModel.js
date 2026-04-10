const { pool } = require('../dbInit');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS installation_requests (
      id SERIAL PRIMARY KEY,
      customer_location TEXT NOT NULL,
      preferred_date DATE NOT NULL,
      product TEXT NOT NULL,
      product_id INTEGER,
      product_price NUMERIC,
      status TEXT NOT NULL DEFAULT 'pending',
      requested_at TIMESTAMP DEFAULT now()
    )
  `);

  await pool.query(`ALTER TABLE installation_requests ADD COLUMN IF NOT EXISTS product TEXT`);
  await pool.query(`ALTER TABLE installation_requests ADD COLUMN IF NOT EXISTS product_id INTEGER`);
  await pool.query(`ALTER TABLE installation_requests ADD COLUMN IF NOT EXISTS product_price NUMERIC`);
  await pool.query(`ALTER TABLE installation_requests ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'`);
  await pool.query(`ALTER TABLE installation_requests ADD COLUMN IF NOT EXISTS requested_at TIMESTAMP DEFAULT now()`);
}

async function create(data) {
  await ensureTable();
  const { customer_location, preferred_date, product, product_id, product_price } = data;
  const res = await pool.query(
    'INSERT INTO installation_requests(customer_location, preferred_date, product, product_id, product_price) VALUES($1,$2,$3,$4,$5) RETURNING *',
    [customer_location, preferred_date, product, product_id || null, product_price || null]
  );
  return res.rows[0];
}

async function list() {
  await ensureTable();
  const res = await pool.query('SELECT * FROM installation_requests ORDER BY requested_at DESC');
  return res.rows;
}

async function updateStatus(id, status) {
  await ensureTable();
  const res = await pool.query(
    'UPDATE installation_requests SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );
  return res.rows[0];
}

module.exports = { create, list, updateStatus };
