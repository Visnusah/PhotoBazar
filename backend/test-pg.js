import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;

async function testPgConnection() {
  const timeout = setTimeout(() => {
    console.log('❌ Connection attempt timed out after 10 seconds');
    process.exit(1);
  }, 10000);

  try {
    console.log('Testing direct pg connection...');
    
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    });

    console.log('Connecting...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('Database version:', result.rows[0].version);
    
    await client.end();
    clearTimeout(timeout);
    console.log('✅ Connection test completed successfully');
  } catch (error) {
    clearTimeout(timeout);
    console.error('❌ Connection failed:', error.message);
    console.error('Error code:', error.code);
  }
  
  process.exit();
}

testPgConnection();
