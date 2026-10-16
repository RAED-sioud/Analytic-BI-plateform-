const { Pool } = require('pg');

// Supports DATABASE_URL (Railway/Render/Neon) or individual env vars
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      options: '-c search_path=technova_dw',
    })
  : new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     process.env.DB_PORT     || 5432,
      user:     process.env.DB_USER     || 'postgres',
      password: process.env.DB_PASSWORD || 'mansour',
      database: process.env.DB_NAME     || 'technova_dw',
      options:  '-c search_path=technova_dw',
    });

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err.message);
});

module.exports = pool;
