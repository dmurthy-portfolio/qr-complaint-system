// =====================================================================
// JWT Authentication Middleware
// Protects admin-only routes. Expects header: Authorization: Bearer <token>
// =====================================================================
const jwt = require('jsonwebtoken');

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Access denied.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.admin = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = authenticateAdmin;
