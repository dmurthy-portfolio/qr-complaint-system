// =====================================================================
// MySQL connection pool
// A connection pool is reused across requests for performance instead
// of opening a new connection every time.
// =====================================================================
require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'complaint_system',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: false,
});

// Quick connectivity check on startup (does not crash the app; just logs)
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ MySQL connection failed:', err.message);
  }
})();

module.exports = pool;
