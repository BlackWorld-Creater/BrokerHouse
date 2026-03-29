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
app.use(cors());
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
        covering_location TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
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
  const { name, mobile, whatsapp, broker_location, covering_location } = req.body;
  
  if (!name || !mobile || !whatsapp || !broker_location || !covering_location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "BrokrsHouse" (name, mobile, whatsapp, broker_location, covering_location) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, mobile, whatsapp, broker_location, covering_location]
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

const PORT = process.env.PORT || 3001;

initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 BrokrsHouse API running on http://localhost:${PORT}`);
  });
});
