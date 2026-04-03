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

async function debug() {
  try {
    console.log('--- TABLES ---');
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log(tables.rows.map(r => r.table_name));

    console.log('\n--- STATES TABLE ---');
    try {
      const statesCols = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'States\'');
      console.log(statesCols.rows);
      const statesData = await pool.query('SELECT * FROM "States"');
      console.log('States Data Count:', statesData.rows.length);
    } catch (e) { console.error('States table error:', e.message); }

    console.log('\n--- CITIES TABLE ---');
    try {
      const citiesCols = await pool.query('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'Cities\'');
      console.log(citiesCols.rows);
      const citiesData = await pool.query('SELECT * FROM "Cities"');
      console.log('Cities Data Count:', citiesData.rows.length);
    } catch (e) { console.error('Cities table error:', e.message); }

    console.log('\n--- CONSTRAINTS ---');
    try {
      const constraints = await pool.query("SELECT conname, contype, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = '\"Cities\"'::regclass");
      console.log(constraints.rows);
    } catch (e) { console.error('Constraints error:', e.message); }

  } catch (err) {
    console.error('Debug script error:', err.message);
  } finally {
    await pool.end();
  }
}

debug();
