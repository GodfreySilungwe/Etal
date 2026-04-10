const { pool } = require('../dbInit');

async function ensureTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT now()
    );
  `);
}

async function getAll() {
  await ensureTable();
  const res = await pool.query('SELECT * FROM services ORDER BY id DESC');
  return res.rows;
}

async function create(service) {
  await ensureTable();
  const { name, description, price } = service;
  const res = await pool.query(
    'INSERT INTO services(name, description, price) VALUES($1,$2,$3) RETURNING *',
    [name, description || null, price || 0]
  );
  return res.rows[0];
}

async function update(id, service) {
  await ensureTable();
  const { name, description, price } = service;
  const res = await pool.query(
    'UPDATE services SET name=$1, description=$2, price=$3 WHERE id=$4 RETURNING *',
    [name, description || null, price || 0, id]
  );
  return res.rows[0];
}

async function remove(id) {
  await ensureTable();
  await pool.query('DELETE FROM services WHERE id=$1', [id]);
}

module.exports = { getAll, create, update, remove };
