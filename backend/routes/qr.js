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

// Analyse a decoded QR URL for safety
function analyseUrl(rawUrl) {
  let cleanUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(cleanUrl)) {
    cleanUrl = 'https://' + cleanUrl;
  }

  let urlObj;
  try {
    urlObj = new URL(cleanUrl);
  } catch (e) {
    return { safe: false, reason: 'Invalid or malformed URL inside QR code.' };
  }

  const domain = urlObj.hostname.toLowerCase();
  const fullPath = (urlObj.pathname + urlObj.search).toLowerCase();

  // Known URL shortener domains — always suspicious as they hide the real destination
  const shortenerDomains = ['bit.ly', 'tinyurl.com', 't.co', 'goo.gl', 'rebrand.ly', 'ow.ly', 'is.gd', 'cutt.ly', 'shorturl.at'];
  const isShortened = shortenerDomains.some(s => domain === s || domain.endsWith('.' + s));

  // Homograph attack: non-latin characters in domain
  const isHomograph = /[\u0400-\u04FF\u0370-\u03FF\u4E00-\u9FFF]/g.test(domain);

  // Scam/phishing keyword check in domain and path
  const scamWords = ['free', 'reward', 'refund', 'bonus', 'collect', 'upi', 'gift', 'parttime', 'job', 'kyc', 'wallet', 'verify', 'claim', 'lottery', 'win', 'prize', 'secure-login', 'update-account'];
  const hitWords = scamWords.filter(w => domain.includes(w) || fullPath.includes(w));

  // Suspicious TLDs (common in scams)
  const suspiciousTLDs = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.link', '.work'];
  const hasSuspiciousTLD = suspiciousTLDs.some(tld => domain.endsWith(tld));

  // Is it HTTPS?
  const isHttps = urlObj.protocol === 'https:';

  // Trusted domains — skip deep checks
  const trustedDomains = ['google.com', 'youtube.com', 'wikipedia.org', 'github.com', 'microsoft.com', 'apple.com', 'amazon.com', 'linkedin.com', 'twitter.com', 'instagram.com', 'facebook.com', 'whatsapp.com', 'gpay.app', 'paytm.com', 'phonepe.com'];
  const isTrusted = trustedDomains.some(td => domain === td || domain.endsWith('.' + td));

  let phishingScore = 0;
  const anomalies = [];

  if (isTrusted) {
    phishingScore = 2;
  } else {
    if (isShortened) {
      phishingScore += 35;
      anomalies.push('Shortened/masked URL — the real destination is hidden.');
    }
    if (isHomograph) {
      phishingScore += 50;
      anomalies.push('Homograph phishing: domain contains non-latin lookalike characters.');
    }
    if (hitWords.length > 0) {
      phishingScore += hitWords.length * 15;
      anomalies.push(`Scam-related keywords found in URL: ${hitWords.join(', ')}`);
    }
    if (hasSuspiciousTLD) {
      phishingScore += 25;
      anomalies.push(`Suspicious top-level domain: ${domain.split('.').pop()}`);
    }
    if (!isHttps) {
      phishingScore += 20;
      anomalies.push('Unencrypted HTTP connection — no SSL/TLS protection.');
    }
  }

  phishingScore = Math.min(phishingScore, 99);

  return {
    cleanUrl,
    domain,
    isShortened,
    isHomograph,
    isHttps,
    hitWords,
    hasSuspiciousTLD,
    isTrusted,
    phishingScore,
    anomalies
  };
}

router.post('/verify', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'QR Code image file is required.' });
  }

  try {
    const fileName = req.file.originalname;
    const fileUrl = req.file.path.replace(/\\/g, '/');

    let decodedText = null;
    let decodeError = null;

    // Attempt real QR decoding with jsqr + jimp
    try {
      const { Jimp } = require('jimp');
      const jsQR = require('jsqr');

      const image = await Jimp.read(req.file.path);
      const { data, width, height } = image.bitmap;
      // jsQR expects Uint8ClampedArray
      const clampedData = new Uint8ClampedArray(data);
      const code = jsQR(clampedData, width, height, { inversionAttempts: 'attemptBoth' });

      if (code) {
        decodedText = code.data;
      } else {
        decodeError = 'QR code could not be detected in the image. Please ensure the image is clear and the QR code is fully visible.';
      }
    } catch (decodeErr) {
      decodeError = 'QR decoding failed: ' + decodeErr.message;
    }

    // If decoding failed entirely
    if (!decodedText) {
      return res.status(422).json({
        message: decodeError || 'Could not decode QR code from this image.',
        decodingFailed: true
      });
    }

    // Analyse the decoded URL/text
    const analysis = analyseUrl(decodedText);
    const { phishingScore, anomalies } = analysis;

    const trustScore = Math.max(100 - phishingScore, 5);
    const riskScore = phishingScore;

    let safetyRating = 'safe';
    if (phishingScore >= 60) {
      safetyRating = 'dangerous';
    } else if (phishingScore >= 25) {
      safetyRating = 'suspicious';
    }

    const verdict = safetyRating === 'safe' ? 'safe' : (safetyRating === 'suspicious' ? 'suspicious' : 'manipulated');

    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `QR code decoded successfully. Destination: ${decodedText}. ${analysis.isTrusted ? 'The link points to a trusted and verified domain.' : 'The URL passes all safety checks — HTTPS is active, no phishing keywords detected, and the domain has a clean profile.'}`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `QR code decodes to: ${decodedText}. Caution advised — ${anomalies.join('. ')}. Verify the sender before opening this link.`;
    } else {
      aiExplanation = `DANGER: QR code points to a high-risk URL (${analysis.domain}). ${anomalies.join('. ')}. Do NOT open this link. This QR code may be part of a phishing or financial scam.`;
    }

    const analysisDetails = {
      decodedText,
      expandedUrl: analysis.cleanUrl,
      domain: analysis.domain,
      safetyRating,
      phishingProbability: phishingScore,
      shortUrlDetection: analysis.isShortened,
      redirectDetection: analysis.isShortened || analysis.hitWords.length > 0,
      httpsAvailable: analysis.isHttps,
      isTrustedDomain: analysis.isTrusted,
      destination: analysis.cleanUrl
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
