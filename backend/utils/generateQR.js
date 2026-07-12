// =====================================================================
// QR Code Generator
// Generates a QR code PNG that links to the public complaint form.
// Can be run standalone: `node utils/generateQR.js`
// It's also exposed via GET /api/qrcode in server.js for on-demand use.
// =====================================================================
require('dotenv').config();
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const targetUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
const outputDir = path.join(__dirname, '..', 'uploads', 'qr');

async function generateQRFile() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  const outputPath = path.join(outputDir, 'complaint-form-qr.png');

  await QRCode.toFile(outputPath, targetUrl, {
    width: 500,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
  });

  console.log(`✅ QR code generated at: ${outputPath}`);
  console.log(`   It points to: ${targetUrl}`);
  return outputPath;
}

// Reusable function for the /api/qrcode route (returns a data URL, no disk write needed)
async function generateQRDataUrl(url = targetUrl) {
  return QRCode.toDataURL(url, {
    width: 500,
    margin: 2,
    color: { dark: '#1e293b', light: '#ffffff' },
  });
}

// Allow running directly: `node utils/generateQR.js`
if (require.main === module) {
  generateQRFile().catch((err) => {
    console.error('Failed to generate QR code:', err);
    process.exit(1);
  });
}

module.exports = { generateQRFile, generateQRDataUrl };
