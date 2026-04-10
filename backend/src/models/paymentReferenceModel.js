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
      processed_at TIMESTAMP,
      submitted_at TIMESTAMP DEFAULT now()
    );
  `);
  await pool.query(`ALTER TABLE payment_references ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP`);
}

async function create(data) {
  await ensureTable();
  const { customer_name, phone, method_used, transaction_reference, product_details } = data;
  let details = [];
  try {
    details = typeof product_details === 'string' ? JSON.parse(product_details || '[]') : (product_details || []);
  } catch (e) {
    details = [];
  }

  const normalizedDetails = Array.isArray(details) ? details.map((item) => {
    const qty = Number(item?.quantity) || 1;
    const basePrice = Number(item?.price) || 0;
    const originalUnitPrice = item?.discount_percent > 0 ? (Number(item?.original_price) || basePrice) : basePrice;
    const discountPercent = Number(item?.discount_percent) || 0;
    const appliedDiscountPerUnit = Math.max(originalUnitPrice - basePrice, 0);
    const installationIncluded = !!item?.installation_selected;
    const deliveryIncluded = !!item?.delivery_selected;
    const installationFee = installationIncluded ? (Number(item?.installation_price) || 0) : 0;
    const deliveryFee = deliveryIncluded ? (Number(item?.delivery_price) || 0) : 0;
    const serviceFee = installationFee + deliveryFee;
    const totalUnitPrice = basePrice + serviceFee;
    const lineTotal = totalUnitPrice * qty;

    return {
      id: item?.id ?? null,
      name: item?.name || 'Unknown Item',
      category: item?.category || 'Uncategorized',
      quantity: qty,
      price: basePrice,
      original_price: originalUnitPrice,
      discount_percent: discountPercent,
      applied_discount_per_unit: appliedDiscountPerUnit,
      installation_included: installationIncluded,
      installation_fee: installationFee,
      delivery_included: deliveryIncluded,
      delivery_fee: deliveryFee,
      service_included: serviceFee > 0,
      service_fee: serviceFee,
      total_unit_price: totalUnitPrice,
      total_price: lineTotal
    };
  }) : [];

  const text = JSON.stringify(normalizedDetails);

  const res = await pool.query(
    `INSERT INTO payment_references(customer_name, phone, method_used, transaction_reference, product_details)
     VALUES($1,$2,$3,$4,$5)
     RETURNING *`,
    [customer_name, phone, method_used, transaction_reference, text]
  );

  if (Array.isArray(normalizedDetails)) {
    for (const item of normalizedDetails) {
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
    'UPDATE payment_references SET service_status=$1, processed_at=CASE WHEN $1 = \'complete\' THEN now() ELSE NULL END WHERE id=$2 RETURNING *',
    [service_status, id]
  );
  return res.rows[0];
}

module.exports = { create, list, updateStatus };
