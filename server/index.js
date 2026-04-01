import express from 'express';
import pg from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Ensure the brokers table exists
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "BrokrsHouse" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        mobile VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        broker_location VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL DEFAULT '',
        covering_location TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Add state column safely
    try {
      await pool.query(`ALTER TABLE "BrokrsHouse" ADD COLUMN state VARCHAR(255) NOT NULL DEFAULT ''`);
    } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Cities" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Add is_active column safely to existing tables
    try {
      await pool.query(`ALTER TABLE "Cities" ADD COLUMN is_active BOOLEAN DEFAULT true`);
    } catch(e) {}

    // Insert default cities if table is newly created
    await pool.query(`
      INSERT INTO "Cities" (name) 
      VALUES ('NCR'), ('Gurugram') 
      ON CONFLICT (name) DO NOTHING
    `);

    console.log('✅ Database table verified/created');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Pass@123';

// POST /api/register — Broker registration
app.post('/api/register', async (req, res) => {
  const { name, mobile, whatsapp, broker_location, state, covering_location } = req.body;

  if (!name || !mobile || !whatsapp || !broker_location || !state || !covering_location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "BrokrsHouse" (name, mobile, whatsapp, broker_location, state, covering_location) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, mobile, whatsapp, broker_location, state, covering_location]
    );
    res.status(201).json({ message: 'Registration successful', broker: result.rows[0] });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/admin/login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '24h' });
    return res.json({ token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

// Auth middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided' });
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// GET /api/admin/brokers — Get all brokers (protected)
app.get('/api/admin/brokers', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "BrokrsHouse" ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/brokers/:id — Delete a broker (protected)
app.delete('/api/admin/brokers/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM "BrokrsHouse" WHERE id = $1', [req.params.id]);
    res.json({ message: 'Broker deleted' });
  } catch (err) {
    console.error('Delete error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/cities — Get all active cities (public)
app.get('/api/cities', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Cities" ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching cities' });
  }
});

// POST /api/admin/cities — Add new city (protected)
app.post('/api/admin/cities', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'City name required' });
  try {
    const result = await pool.query('INSERT INTO "Cities" (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error adding city. It might already exist.' });
  }
});

// PUT /api/admin/cities/:id/toggle — Toggle city active status
app.put('/api/admin/cities/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE "Cities" SET is_active = NOT COALESCE(is_active, true) 
       WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'City not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Toggle city error:', err.message);
    res.status(500).json({ error: 'Server error toggling city' });
  }
});

// DELETE /api/admin/cities/:id — Delete city (protected)
app.delete('/api/admin/cities/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM "Cities" WHERE id = $1', [req.params.id]);
    res.json({ message: 'City deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting city' });
  }
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'production') {
  initDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 BrokrsHouse API running on http://localhost:${PORT}`);
    });
  });
}

export default app;
