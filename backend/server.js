// =====================================================================
// QR Complaint Management System — Backend Entry Point
// =====================================================================
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const { generateQRDataUrl } = require('./utils/generateQR');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',');
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded complaint images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// On-demand QR code for the complaint form (returns a base64 PNG data URL)
app.get('/api/qrcode', async (req, res) => {
  try {
    const url = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
    const dataUrl = await generateQRDataUrl(url);
    res.json({ success: true, qrCode: dataUrl, targetUrl: url });
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate QR code.' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------
// Error handling (Multer errors, unexpected file type, etc.)
// ---------------------------------------------------------------------
app.use((err, req, res, next) => {
  if (err.name === 'MulterError' || err.message?.includes('Only image files')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ---------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
