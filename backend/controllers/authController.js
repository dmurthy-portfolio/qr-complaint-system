// =====================================================================
// Auth Controller — handles admin login
// =====================================================================
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

// POST /api/auth/login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const [rows] = await pool.query('SELECT * FROM admins WHERE username = ?', [username]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const admin = rows[0];
    const passwordMatches = await bcrypt.compare(password, admin.password_hash);

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      admin: { id: admin.id, username: admin.username },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during login.' });
  }
}

// GET /api/auth/verify — used by frontend to check if token is still valid
async function verify(req, res) {
  // If this handler runs, the authenticateAdmin middleware already validated the token
  return res.json({ success: true, admin: req.admin });
}

module.exports = { login, verify };
