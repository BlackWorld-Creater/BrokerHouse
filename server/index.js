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
        firm_name VARCHAR(255) DEFAULT '',
        mobile VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50) NOT NULL,
        broker_location VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL DEFAULT '',
        covering_location TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    
    // Add columns safely
    try {
      await pool.query(`ALTER TABLE "BrokrsHouse" ADD COLUMN state VARCHAR(255) NOT NULL DEFAULT ''`);
    } catch(e) {}
    try {
      await pool.query(`ALTER TABLE "BrokrsHouse" ADD COLUMN firm_name VARCHAR(255) DEFAULT ''`);
    } catch(e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "States" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "Cities" (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        state_id INTEGER REFERENCES "States"(id) ON DELETE CASCADE,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Ensure the state_id column exists and has proper cascading delete
    try {
      // Drop any existing constraint variations to avoid conflicts
      await pool.query(`ALTER TABLE "Cities" DROP CONSTRAINT IF EXISTS cities_state_id_fkey`);
      await pool.query(`ALTER TABLE "Cities" DROP CONSTRAINT IF EXISTS "Cities_state_id_fkey"`);
      await pool.query(`ALTER TABLE "Cities" ADD CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES "States"(id) ON DELETE CASCADE`);
    } catch(e) {
      console.error('Constraint update error:', e.message);
    }

    // Map Cities to States
    const states = ['Delhi (NCR)', 'Haryana', 'Uttar Pradesh', 'Rajasthan'];
    for (const stateName of states) {
      await pool.query(`INSERT INTO "States" (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [stateName]);
    }

    // Map Cities to States
    const stateMapping = {
      'Delhi (NCR)': ['Delhi', 'New Delhi', 'Okhla', 'Rohini', 'Dwarka'],
      'Haryana': ['Gurugram', 'Faridabad', 'Sonipat', 'Panipat', 'Ambala', 'Panchkula', 'Rohtak', 'Karnal'],
      'Uttar Pradesh': ['Noida', 'Greater Noida', 'Ghaziabad', 'Meerut', 'Agra', 'Lucknow', 'Kanpur', 'Varanasi', 'Prayagraj'],
      'Rajasthan': ['Jaipur', 'Alwar', 'Bhiwadi', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner']
    };

    for (const [stateName, citiesList] of Object.entries(stateMapping)) {
      const stateRes = await pool.query(`SELECT id FROM "States" WHERE name = $1`, [stateName]);
      const stateId = stateRes.rows[0].id;
      for (const cityName of citiesList) {
        await pool.query(`
          INSERT INTO "Cities" (name, state_id) 
          VALUES ($1, $2) 
          ON CONFLICT (name) DO UPDATE SET state_id = $2
        `, [cityName, stateId]);
      }
    }

    console.log('✅ Database schema verified and data seeded');
  } catch (err) {
    console.error('❌ DB init error:', err.message);
  }
}

// Admin credentials
const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Pass@123';

// POST /api/register — Broker registration
app.post('/api/register', async (req, res) => {
  const { name, firm_name, mobile, whatsapp, broker_location, state, covering_location } = req.body;

  if (!name || !mobile || !whatsapp || !broker_location || !covering_location) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO "BrokrsHouse" (name, firm_name, mobile, whatsapp, broker_location, state, covering_location) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, firm_name || '', mobile, whatsapp, broker_location, state, covering_location]
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
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token' });
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

// GET /api/states — Get all active states (public)
app.get('/api/states', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "States" WHERE is_active = true ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching states' });
  }
});

// GET /api/cities — Get cities (optionally filtered by state)
app.get('/api/cities', async (req, res) => {
  const { state_id } = req.query;
  try {
    let query = 'SELECT * FROM "Cities" WHERE is_active = true';
    let params = [];
    
    if (state_id) {
      query += ' AND state_id = $1';
      params.push(state_id);
    }
    
    query += ' ORDER BY name ASC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching cities' });
  }
});

// ADMIN STATES & CITIES CRUD
app.get('/api/admin/states', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "States" ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin states' });
  }
});

app.post('/api/admin/states', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'State name required' });
  try {
    const result = await pool.query('INSERT INTO "States" (name) VALUES ($1) RETURNING *', [name]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error adding state' });
  }
});

// Update state name
app.put('/api/admin/states/:id', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = await pool.query('UPDATE "States" SET name = $1 WHERE id = $2 RETURNING *', [name, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error updating state' });
  }
});

app.put('/api/admin/states/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('UPDATE "States" SET is_active = NOT is_active WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error toggling state' });
  }
});

app.delete('/api/admin/states/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    // Explicitly delete cities first to ensure reliable cascading even if DB constraints differ
    await pool.query('DELETE FROM "Cities" WHERE state_id = $1', [id]);
    const result = await pool.query('DELETE FROM "States" WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'State not found' });
    }
    
    res.json({ message: 'State and its cities deleted successfully' });
  } catch (err) {
    console.error('State delete error:', err.message);
    res.status(500).json({ error: 'Error deleting state' });
  }
});

app.get('/api/admin/cities', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM "Cities" ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching admin cities' });
  }
});

app.post('/api/admin/cities', authMiddleware, async (req, res) => {
  const { name, state_id } = req.body;
  if (!name || !state_id) return res.status(400).json({ error: 'Name and state_id required' });
  try {
    const result = await pool.query('INSERT INTO "Cities" (name, state_id) VALUES ($1, $2) RETURNING *', [name, state_id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error adding city' });
  }
});

app.put('/api/admin/cities/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query('UPDATE "Cities" SET is_active = NOT is_active WHERE id = $1 RETURNING *', [req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error toggling city' });
  }
});

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
