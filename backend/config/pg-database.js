import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client, Pool } = pg;

// Create a connection pool for local PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'photobazaar',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
  max: 5,
  min: 0,
  acquireTimeoutMillis: 30000,
  idleTimeoutMillis: 10000,
});

// Test the connection
export async function testDatabaseConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW(), version()');
    client.release();
    console.log('✅ Database connection verified:', result.rows[0].now);
    console.log('📊 PostgreSQL version:', result.rows[0].version.split(',')[0]);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Query function for direct database access
export async function query(text, params) {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Close the pool
export async function closePool() {
  await pool.end();
}

export default pool;
