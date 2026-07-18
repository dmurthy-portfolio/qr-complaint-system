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
  getPublicComplaint,
  updateStatus,
  updateRemark,
  deleteComplaint,
  downloadImage,
} = require('../controllers/complaintController');

// -------------------- PUBLIC --------------------

// POST /api/complaints
router.post('/', upload.single('image'), createComplaint);
// Public complaint status
router.get('/public/:id', getPublicComplaint);

// -------------------- ADMIN --------------------

// GET all complaints
router.get('/', authenticateAdmin, getComplaints);

// GET single complaint
router.get('/:id', authenticateAdmin, getComplaintById);

// Update complaint status
router.patch('/:id/status', authenticateAdmin, updateStatus);

// Update admin remark
router.patch('/:id/remark', authenticateAdmin, updateRemark);

// Download complaint image
router.get('/:id/download', authenticateAdmin, downloadImage);

// Delete complaint
router.delete('/:id', authenticateAdmin, deleteComplaint);

module.exports = router;