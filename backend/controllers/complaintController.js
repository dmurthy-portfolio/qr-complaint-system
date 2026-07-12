// =====================================================================
// Complaint Controller
// Handles: public complaint submission, admin listing/search/filter,
// status updates, deletion, and image download.
// =====================================================================
const path = require('path');
const cloudinary = require('../config/cloudinary');
const pool = require('../config/db');

const VALID_STATUSES = ['Pending', 'In Progress', 'Resolved'];

// ---------------------------------------------------------------------
// POST /api/complaints  (public)
// Create a new complaint. Requires name + image. Mobile is optional.
// ---------------------------------------------------------------------
async function createComplaint(req, res) {
  try {
    const { name, mobile_number } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Name is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Complaint image is required.' });
    }

    // Basic mobile number validation only if provided (digits, 7-15 chars)
    if (mobile_number && !/^[0-9+\-\s]{7,15}$/.test(mobile_number)) {
      return res.status(400).json({ success: false, message: 'Invalid mobile number format.' });
    }

    const imagePath = req.file.path;

    const [result] = await pool.query(
      `INSERT INTO complaints (name, mobile_number, image_path, status)
       VALUES (?, ?, ?, 'Pending')`,
      [name.trim(), mobile_number ? mobile_number.trim() : null, imagePath]
    );

    return res.status(201).json({
      success: true,
      message: 'Your complaint has been submitted successfully.',
      complaintId: result.insertId,
    });
  } catch (err) {
    console.error('Create complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error while submitting complaint.' });
  }
}

// ---------------------------------------------------------------------
// GET /api/complaints  (admin, protected)
// Supports query params: search, status, page, limit
// ---------------------------------------------------------------------
async function getComplaints(req, res) {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;

    const conditions = [];
    const params = [];

    if (search) {
      conditions.push('(name LIKE ? OR mobile_number LIKE ? OR id = ?)');
      const like = `%${search}%`;
      params.push(like, like, isNaN(search) ? 0 : Number(search));
    }

    if (status && VALID_STATUSES.includes(status)) {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const offset = (pageNum - 1) * limitNum;

    const [rows] = await pool.query(
      `SELECT id, name, mobile_number, image_path, status, created_at, updated_at
       FROM complaints
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM complaints ${whereClause}`,
      params
    );

    return res.json({
      success: true,
      data: rows,
      pagination: {
        total: countRows[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countRows[0].total / limitNum),
      },
    });
  } catch (err) {
    console.error('Get complaints error:', err);
    return res.status(500).json({ success: false, message: 'Server error while fetching complaints.' });
  }
}

// ---------------------------------------------------------------------
// GET /api/complaints/:id  (admin, protected)
// ---------------------------------------------------------------------
async function getComplaintById(req, res) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM complaints WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    return res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Get complaint error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
}

// ---------------------------------------------------------------------
// PATCH /api/complaints/:id/status  (admin, protected)
// ---------------------------------------------------------------------
async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
      });
    }

    const [result] = await pool.query('UPDATE complaints SET status = ? WHERE id = ?', [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    return res.json({ success: true, message: 'Status updated successfully.' });
  } catch (err) {
    console.error('Update status error:', err);
    return res.status(500).json({ success: false, message: 'Server error while updating status.' });
  }
}

// ---------------------------------------------------------------------
// DELETE /api/complaints/:id  (admin, protected)
// Deletes the DB record and the associated uploaded image file.
// ---------------------------------------------------------------------
async function deleteComplaint(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT image_path FROM complaints WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    const imageUrl = rows[0].image_path;

    // Delete image from Cloudinary
    try {
      const parts = imageUrl.split('/');
      const filename = parts[parts.length - 1];
      const publicId =
        'complaint-system/' + filename.substring(0, filename.lastIndexOf('.'));

      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.warn('Could not delete Cloudinary image:', err.message);
    }

    await pool.query('DELETE FROM complaints WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Complaint deleted successfully.',
    });
  } catch (err) {
    console.error('Delete complaint error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting complaint.',
    });
  }
}
// ---------------------------------------------------------------------
// GET /api/complaints/:id/download  (admin, protected)
// Streams the uploaded image back as a downloadable file.
// ---------------------------------------------------------------------
async function downloadImage(req, res) {
  try {
    const { id } = req.params;

    const [rows] = await pool.query(
      'SELECT image_path FROM complaints WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    return res.json({
      success: true,
      imageUrl: rows[0].image_path,
    });
  } catch (err) {
    console.error('Download image error:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while downloading image.',
    });
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateStatus,
  deleteComplaint,
  downloadImage,
};