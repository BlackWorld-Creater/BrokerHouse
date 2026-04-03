import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testDelete() {
  try {
    const states = await pool.query('SELECT * FROM "States" LIMIT 5');
    if (states.rows.length > 0) {
      const id = states.rows[states.rows.length - 1].id;
      console.log('Attempting to delete state ID:', id, 'Name:', states.rows[states.rows.length - 1].name);
      
      // Attempt the identical queries from the server route
      try {
        await pool.query('DELETE FROM "Cities" WHERE state_id = $1', [id]);
        console.log('Cities deleted');
        const res = await pool.query('DELETE FROM "States" WHERE id = $1', [id]);
        console.log('States deleted, rowCount:', res.rowCount);
      } catch (err) {
        console.error('DELETE ERROR CAUGHT:', err.message);
      }
    } else {
      console.log('No states found to delete.');
    }
  } catch (err) {
    console.error('Setup error:', err.message);
  } finally {
    pool.end();
  }
}

testDelete();
