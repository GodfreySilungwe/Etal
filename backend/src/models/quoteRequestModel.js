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
      processed_at TIMESTAMP,
      requested_at TIMESTAMP DEFAULT now()
    );
  `);
  await pool.query(`ALTER TABLE quote_requests ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP`);
}

async function create(data) {
  await ensureTable();
  const { customer_name, phone, email, details, product_details } = data;
  let items = [];
  try {
    items = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  } catch (e) {
    items = [];
  }

  const normalizedItems = Array.isArray(items) ? items.map((item) => {
    const qty = Number(item?.quantity) || 1;
    const price = Number(item?.price) || 0;
    const originalPrice = item?.discount_percent > 0 ? (Number(item?.original_price) || price) : price;
    const discountPercent = Number(item?.discount_percent) || 0;
    const discountAmountPerUnit = Math.max(originalPrice - price, 0);
    const lineAmount = price * qty;
    return {
      id: item?.id ?? null,
      name: item?.name || 'Unknown Item',
      category: item?.category || 'Uncategorized',
      quantity: qty,
      unit_price: price,
      original_unit_price: originalPrice,
      discount_percent: discountPercent,
      discount_amount_per_unit: discountAmountPerUnit,
      line_amount: lineAmount
    };
  }) : [];

  const res = await pool.query(
    `INSERT INTO quote_requests(customer_name, phone, email, details, product_details)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [customer_name, phone, email || null, details || null, JSON.stringify(normalizedItems)]
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
  const res = await pool.query(
    'UPDATE quote_requests SET status=$1, processed_at=CASE WHEN $1 = \'complete\' THEN now() ELSE NULL END WHERE id=$2 RETURNING *',
    [status, id]
  );
  return res.rows[0];
}

module.exports = { create, list, updateStatus };
