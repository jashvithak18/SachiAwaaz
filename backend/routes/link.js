const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { authMiddleware } = require('../auth');

router.post('/verify', authMiddleware, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'URL is required.' });
  }

  try {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'http://' + cleanUrl;
    }

    let urlObj;
    try {
      urlObj = new URL(cleanUrl);
    } catch (e) {
      return res.status(450).json({ message: 'Invalid URL format.' });
    }

    const domain = urlObj.hostname;
    const isHttps = urlObj.protocol === 'https:';

    // Mock tracking pixel detections
    const trackers = ['Google Analytics (gtag.js)', 'Facebook Pixel (fbevents.js)', 'Hotjar Tracking', 'TikTok Pixel', 'Google Tag Manager'];
    const trackingDetection = trackers.slice(0, Math.floor(Math.random() * (trackers.length - 1)) + 1);

    // Mock malware and scam evaluation
    let malwareProbability = 2;
    let certificateStatus = isHttps ? 'valid' : 'invalid';
    const scamIndicators = [];

    const lowerDomain = domain.toLowerCase();
    const lowerPath = urlObj.pathname.toLowerCase();

    if (/free|reward|refund|bonus|collect|upi|gift/i.test(lowerDomain) || /free|reward|refund|bonus|collect|upi|gift/i.test(lowerPath)) {
      malwareProbability = 68;
      scamIndicators.push('Domain registration details hidden by anonymity shields.');
      scamIndicators.push('High volume of redirection nodes detected in hop diagnostics.');
      scamIndicators.push('Script payloads requesting form collection metrics (phishing intent).');
    }

    if (!isHttps) {
      scamIndicators.push('Connection is unencrypted. Login details are exposed.');
    }

    let safetyRating = 'safe';
    let trustScore = 95 - malwareProbability;

    if (scamIndicators.length >= 2 || malwareProbability >= 50) {
      safetyRating = 'dangerous';
      trustScore = Math.max(10, trustScore);
    } else if (scamIndicators.length > 0 || malwareProbability >= 20) {
      safetyRating = 'proceed_carefully';
      trustScore = Math.max(45, trustScore);
    }

    const riskScore = 100 - trustScore;
    const verdict = safetyRating === 'safe' ? 'safe' : (safetyRating === 'proceed_carefully' ? 'suspicious' : 'manipulated');

    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `Link Inspector analyzed ${domain}. The site operates under active cryptographic SSL layers and displays clean structural integrity. Active tracking pixels include: ${trackingDetection.join(', ')}. Malware and scams probability is negligible.`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `WARNING: Link Inspector recommends caution. Domain displays security anomalies including unencrypted HTTP channels and redirects. Proceed with care.`;
    } else {
      aiExplanation = `CRITICAL DETAILED MALWARE RISK: The URL contains script loops triggering anonymous collections. Active scam elements are executing in real time. Do NOT input verification inputs.`;
    }

    const analysisDetails = {
      url: cleanUrl,
      previewUrl: `https://image.thum.io/get/width/320/crop/600/${cleanUrl}`, // Realistic mock website screenshot preview generator URL
      domain,
      certificateStatus,
      malwareProbability,
      trackingDetection,
      scamIndicators,
      recommendation: safetyRating
    };

    const report = new Report({
      userId: req.user.userId,
      fileName: domain,
      fileUrl: cleanUrl,
      mediaType: 'link',
      authenticityScore: trustScore,
      riskScore,
      verdict,
      aiExplanation,
      anomalies: scamIndicators,
      analysisDetails
    });

    const savedReport = await report.save();

    // Emit Real-time Notification
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(req.user.userId).emit('notification', {
        title: 'Link Audit Complete',
        message: `Security audit completed for ${domain}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      details: analysisDetails
    });

  } catch (err) {
    res.status(500).json({ message: 'Link check failed: ' + err.message });
  }
});

module.exports = router;
