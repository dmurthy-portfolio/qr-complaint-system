// =====================================================================
// Seed / Reset Admin Account
// Usage:  node utils/seedAdmin.js <username> <password>
// If the username already exists, its password is updated instead.
// =====================================================================
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/db');

async function seedAdmin() {
  const [username, password] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Usage: node utils/seedAdmin.js <username> <password>');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const [existing] = await pool.query('SELECT id FROM admins WHERE username = ?', [username]);

    if (existing.length > 0) {
      await pool.query('UPDATE admins SET password_hash = ? WHERE username = ?', [passwordHash, username]);
      console.log(`✅ Password updated for existing admin "${username}".`);
    } else {
      await pool.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
      console.log(`✅ Admin "${username}" created successfully.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to seed admin:', err.message);
    process.exit(1);
  }
}

seedAdmin();
