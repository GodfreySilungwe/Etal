const { pool } = require('../dbInit');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      price NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
  await pool.query(`ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT`);
}

async function getAll() {
  await ensureTable();
  const res = await pool.query('SELECT * FROM services ORDER BY id DESC');
  return res.rows;
}

async function create(service) {
  await ensureTable();
  const { name, description, image_url, price } = service;
  const res = await pool.query(
    'INSERT INTO services(name, description, image_url, price) VALUES($1,$2,$3,$4) RETURNING *',
    [name, description || null, image_url || null, price || 0]
  );
  return res.rows[0];
}

async function update(id, service) {
  await ensureTable();
  const { name, description, image_url, price } = service;
  const res = await pool.query(
    'UPDATE services SET name=$1, description=$2, image_url=$3, price=$4 WHERE id=$5 RETURNING *',
    [name, description || null, image_url || null, price || 0, id]
  );
  return res.rows[0];
}

async function remove(id) {
  await ensureTable();
  await pool.query('DELETE FROM services WHERE id=$1', [id]);
}

module.exports = { getAll, create, update, remove };
