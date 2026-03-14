const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Silungwe%402025@localhost:5432/ETALDB';
const pool = new Pool({ connectionString });

async function initDb() {
  // Create tables if not exists
  const sql = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    category_id INTEGER,
    description TEXT,
    price NUMERIC,
    original_price NUMERIC,
    discount_percent INTEGER DEFAULT 0,
    specs JSONB,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS invoice_requests (
    id SERIAL PRIMARY KEY,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    product_details TEXT,
    requested_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS installation_requests (
    id SERIAL PRIMARY KEY,
    customer_location TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    product TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS delivery_requests (
    id SERIAL PRIMARY KEY,
    delivery_address TEXT NOT NULL,
    phone TEXT NOT NULL,
    order_details TEXT NOT NULL,
    requested_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    author TEXT,
    content TEXT,
    created_at TIMESTAMP DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT now()
  );
  `;

  await pool.query(sql);

  // Add new columns if not exist
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price NUMERIC`);
  await pool.query(`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0`);

  // Seed a default category and sample product if none exist
  const catRes = await pool.query('SELECT COUNT(*) FROM categories');
  if (Number(catRes.rows[0].count) === 0) {
    await pool.query('INSERT INTO categories(name) VALUES($1)', ['Fridges']);
  }

  const prodRes = await pool.query('SELECT COUNT(*) FROM products');
  if (Number(prodRes.rows[0].count) === 0) {
    const c = await pool.query('SELECT id FROM categories WHERE name=$1 LIMIT 1', ['Fridges']);
    const catId = c.rows[0] ? c.rows[0].id : null;
    await pool.query(
      `INSERT INTO products(name, category_id, description, price, original_price, discount_percent, specs, image_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        'Sample Fridge Model X',
        catId,
        'Energy efficient fridge with 300L capacity',
        499.99,
        499.99,
        0,
        JSON.stringify({ capacity: '300L', energy_rating: 'A+' }),
        ''
      ]
    );
  }

  // Seed admin user from env if none exist
  const usersRes = await pool.query('SELECT COUNT(*) FROM users');
  if (Number(usersRes.rows[0].count) === 0) {
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'adminpass';
    const hash = await bcrypt.hash(adminPass, 10);
    await pool.query('INSERT INTO users(username, password_hash, role) VALUES($1,$2,$3)', [adminUser, hash, 'admin']);
    console.log('Seeded admin user:', adminUser);
  }
}

module.exports = { initDb, pool };
