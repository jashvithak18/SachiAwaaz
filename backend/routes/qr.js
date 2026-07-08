const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const { authMiddleware } = require('../auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/checks';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
      return cb(null, true);
    }
    cb(new Error('Only image formats (.jpg, .jpeg, .png) are allowed.'));
  }
});

router.post('/verify', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'QR Code image file is required.' });
  }

  try {
    const fileName = req.file.originalname;
    const fileUrl = req.file.path.replace(/\\/g, '/');

    // Simulate QR decoding
    let decodedText = 'https://google.com';
    let expandedUrl = 'https://google.com';
    let phishingProbability = 5;
    let shortUrlDetection = false;
    let redirectDetection = false;

    const lowerName = fileName.toLowerCase();
    
    // Check filename patterns to make mock realistic
    if (lowerName.includes('scam') || lowerName.includes('suspicious') || lowerName.includes('free') || lowerName.includes('upi') || lowerName.includes('payment')) {
      decodedText = 'https://bit.ly/claim-upi-refund';
      expandedUrl = 'https://secure-upi-refund-verification.net/gpay/receive';
      phishingProbability = 89;
      shortUrlDetection = true;
      redirectDetection = true;
    } else if (lowerName.includes('short') || lowerName.includes('redirect')) {
      decodedText = 'https://tinyurl.com/meeting-invite-402';
      expandedUrl = 'https://meeting-secure-zoom-login.org/auth/login';
      phishingProbability = 65;
      shortUrlDetection = true;
      redirectDetection = true;
    } else {
      // Random mock selection
      const options = [
        { text: 'https://pay.gpay.net.in/invoice/pay?id=83921', expanded: 'https://scam-pay-portal.com/upi/collect?amount=5000', phish: 82, short: false, redir: true },
        { text: 'https://free-movie-tickets.info', expanded: 'https://free-movie-tickets.info/ads/install.exe', phish: 75, short: false, redir: false },
        { text: 'https://wikipedia.org/wiki/QR_code', expanded: 'https://wikipedia.org/wiki/QR_code', phish: 1, short: false, redir: false }
      ];
      const selected = options[Math.floor(Math.random() * options.length)];
      decodedText = selected.text;
      expandedUrl = selected.expanded;
      phishingProbability = selected.phish;
      shortUrlDetection = selected.short;
      redirectDetection = selected.redir;
    }

    let safetyRating = 'safe';
    let trustScore = 100 - phishingProbability;
    const anomalies = [];

    if (shortUrlDetection) {
      anomalies.push('Masked Destination: QR contains a shortened URL to conceal the real domain.');
    }
    if (redirectDetection) {
      anomalies.push('Active Redirect Chain: URL triggers automatic redirection scripts.');
    }
    if (phishingProbability >= 70) {
      safetyRating = 'dangerous';
      anomalies.push('Scam Signature: Destination domain matches known financial harvest templates.');
    } else if (phishingProbability >= 30) {
      safetyRating = 'suspicious';
      anomalies.push('Reputation Warning: The domain age or SSL certificate lacks standard validation.');
    }

    const riskScore = 100 - trustScore;
    const verdict = safetyRating === 'safe' ? 'safe' : (safetyRating === 'suspicious' ? 'suspicious' : 'manipulated');

    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `QR code successfully decoded to: ${decodedText}. The link points directly to a reputable platform with solid domain history, active HTTPS, and clear redirections. No malicious scripts or financial traps were detected.`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `WARNING: QR code points to a suspicious landing target. Shortened links are utilized, or domain registries are registered anonymously. Scan indicators suggest caution before proceeding.`;
    } else {
      aiExplanation = `CRITICAL PAYLOAD WARNING: QR code contains phishing triggers. It expands to a fake financial collection request disguised as a refund channel. Proceeding will expose billing credentials. Do NOT open.`;
    }

    const analysisDetails = {
      decodedText,
      expandedUrl,
      safetyRating,
      phishingProbability,
      shortUrlDetection,
      redirectDetection,
      destination: expandedUrl
    };

    const report = new Report({
      userId: req.user.userId,
      fileName,
      fileUrl,
      mediaType: 'qr',
      authenticityScore: trustScore,
      riskScore,
      verdict,
      aiExplanation,
      anomalies,
      analysisDetails
    });

    const savedReport = await report.save();

    // Emit Real-time Notification
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(req.user.userId).emit('notification', {
        title: 'QR Security Decoded',
        message: `Safety inspection completed for QR: ${fileName}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      details: analysisDetails
    });

  } catch (err) {
    res.status(500).json({ message: 'QR Code audit failed: ' + err.message });
  }
});

module.exports = router;
