// =====================================================================
// Auth Routes
// =====================================================================
const express = require('express');
const router = express.Router();
const { login, verify } = require('../controllers/authController');
const authenticateAdmin = require('../middleware/auth');

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify  (protected — used to confirm token validity on app load)
router.get('/verify', authenticateAdmin, verify);

module.exports = router;
