const { pool } = require('../dbInit');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payment_references (
      id SERIAL PRIMARY KEY,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      method_used TEXT NOT NULL,
      transaction_reference TEXT NOT NULL,
      product_details TEXT,
      service_status TEXT NOT NULL DEFAULT 'pending',
      submitted_at TIMESTAMP DEFAULT now()
    );
  `);
}

async function create(data) {
  await ensureTable();
  const { customer_name, phone, method_used, transaction_reference, product_details } = data;
  const details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  const text = JSON.stringify(details);

  const res = await pool.query(
    `INSERT INTO payment_references(customer_name, phone, method_used, transaction_reference, product_details)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [customer_name, phone, method_used, transaction_reference, text]
  );

  if (Array.isArray(details)) {
    for (const item of details) {
      if (!item || !item.id) continue;
      const qty = Number(item.quantity) || 1;
      await pool.query(
        'UPDATE products SET stock = GREATEST(COALESCE(stock, 0) - $2, 0) WHERE id=$1',
        [item.id, qty]
      );
    }
  }

  return res.rows[0];
}

async function list() {
  await ensureTable();
  const res = await pool.query('SELECT * FROM payment_references ORDER BY submitted_at DESC');
  return res.rows;
}

async function updateStatus(id, service_status) {
  await ensureTable();
  const res = await pool.query(
    'UPDATE payment_references SET service_status=$1 WHERE id=$2 RETURNING *',
    [service_status, id]
  );
  return res.rows[0];
}

module.exports = { create, list, updateStatus };
