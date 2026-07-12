// =====================================================================
// Complaint Routes
// =====================================================================
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const authenticateAdmin = require('../middleware/auth');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint,
  downloadImage,
} = require('../controllers/complaintController');

// -------------------- PUBLIC --------------------
// POST /api/complaints — submit a new complaint (from the QR-code page)
router.post('/', upload.single('image'), createComplaint);

// -------------------- ADMIN (protected) --------------------
// GET /api/complaints — list complaints (supports ?search=&status=&page=&limit=)
router.get('/', authenticateAdmin, getComplaints);

// GET /api/complaints/:id — get single complaint
router.get('/:id', authenticateAdmin, getComplaintById);

// PATCH /api/complaints/:id/status — update status
router.patch('/:id/status', authenticateAdmin, updateStatus);

// GET /api/complaints/:id/download — download the uploaded image
router.get('/:id/download', authenticateAdmin, downloadImage);

// DELETE /api/complaints/:id — delete a complaint
router.delete('/:id', authenticateAdmin, deleteComplaint);

module.exports = router;
