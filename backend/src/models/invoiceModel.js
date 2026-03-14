const { pool } = require('../dbInit');

async function create(data) {
  const { customer_name, phone, email, product_details } = data;
  const details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  const text = JSON.stringify(details);

  const res = await pool.query(
    'INSERT INTO invoice_requests(customer_name, phone, email, product_details) VALUES($1,$2,$3,$4) RETURNING *',
    [customer_name, phone, email || null, text]
  );

  // Decrement inventory stock based on sold products (1 unit per item)
  if (Array.isArray(details)) {
    for (const item of details) {
      if (!item || !item.id) continue;
      await pool.query(
        'UPDATE products SET stock = GREATEST(COALESCE(stock, 0) - 1, 0) WHERE id=$1',
        [item.id]
      );
    }
  }

  return res.rows[0];
}

async function list() {
  const res = await pool.query('SELECT * FROM invoice_requests ORDER BY requested_at DESC');
  return res.rows;
}

module.exports = { create, list };
