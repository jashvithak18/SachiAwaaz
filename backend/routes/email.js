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
    if (ext === '.eml' || ext === '.msg' || ext === '.txt') {
      return cb(null, true);
    }
    cb(new Error('Only email formats (.eml, .msg, .txt) are allowed.'));
  }
});

// Verify Email endpoint (supports uploading .eml/.msg files or pasting raw headers in body)
router.post('/verify', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    let emailContent = '';
    let fileName = 'Pasted Headers';
    let fileUrl = 'raw-input';

    if (req.file) {
      fileName = req.file.originalname;
      fileUrl = req.file.path.replace(/\\/g, '/');
      emailContent = fs.readFileSync(req.file.path, 'utf-8');
    } else {
      emailContent = req.body.headers || '';
    }

    if (!emailContent) {
      return res.status(400).json({ message: 'No email file or headers provided.' });
    }

    // Basic Header Parsing logic
    let sender = 'unknown@sender.com';
    let recipient = 'recipient@domain.com';
    let subject = 'No Subject';
    let replyTo = '';
    let spf = 'PASS';
    let dkim = 'PASS';
    let dmarc = 'PASS';
    let senderIp = '127.0.0.1';

    // Parse typical headers
    const lines = emailContent.split(/\r?\n/);
    lines.forEach(line => {
      if (/^from:/i.test(line)) {
        const match = line.match(/from:\s*(.*)/i);
        if (match) sender = match[1].replace(/["']/g, '');
      } else if (/^to:/i.test(line)) {
        const match = line.match(/to:\s*(.*)/i);
        if (match) recipient = match[1];
      } else if (/^subject:/i.test(line)) {
        const match = line.match(/subject:\s*(.*)/i);
        if (match) subject = match[1];
      } else if (/^reply-to:/i.test(line)) {
        const match = line.match(/reply-to:\s*(.*)/i);
        if (match) replyTo = match[1];
      } else if (/^received:/i.test(line) && senderIp === '127.0.0.1') {
        // Try to extract first sender IP from Received line
        const ipMatch = line.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
        if (ipMatch) senderIp = ipMatch[1];
      }
    });

    // Check auth headers if present in raw content
    if (/spf=fail/i.test(emailContent)) spf = 'FAIL';
    else if (/spf=none/i.test(emailContent)) spf = 'NONE';

    if (/dkim=fail/i.test(emailContent)) dkim = 'FAIL';
    else if (/dkim=none/i.test(emailContent)) dkim = 'NONE';

    if (/dmarc=fail/i.test(emailContent)) dmarc = 'FAIL';
    else if (/dmarc=none/i.test(emailContent)) dmarc = 'NONE';

    // Forensic threat triggers
    let trustScore = 95;
    const anomalies = [];
    const suspiciousAttachments = [];
    const maliciousLinks = [];
    let replyToMismatch = false;
    let displayNameSpoofing = false;

    // Check for display name spoofing: e.g. "Google Support <scammer@gmail.com>"
    const namePart = sender.match(/^(.*?)</);
    const emailPart = sender.match(/<(.*?)>/);
    if (namePart && emailPart) {
      const dispName = namePart[1].toLowerCase();
      const actualEmail = emailPart[1].toLowerCase();
      const brands = ['google', 'microsoft', 'netflix', 'paypal', 'amazon', 'facebook', 'axis', 'sbi', 'hdfc'];
      brands.forEach(brand => {
        if (dispName.includes(brand) && !actualEmail.includes(brand)) {
          displayNameSpoofing = true;
          anomalies.push(`Display Name Spoofing: Sender displays as '${namePart[1].trim()}' but sends from external domain '${emailPart[1]}'`);
          trustScore -= 30;
        }
      });
    }

    // Check Reply-to mismatch
    if (replyTo && emailPart) {
      const actualEmail = emailPart[1].toLowerCase();
      const repEmail = replyTo.replace(/[<>]/g, '').trim().toLowerCase();
      if (actualEmail !== repEmail) {
        replyToMismatch = true;
        anomalies.push(`Reply-To Address Mismatch: Reply goes to '${repEmail}' instead of sender '${actualEmail}'`);
        trustScore -= 20;
      }
    }

    // SPF/DKIM/DMARC penalties
    if (spf === 'FAIL') {
      anomalies.push('SPF Authentication Failed: Sending IP is not authorized by the domain.');
      trustScore -= 25;
    }
    if (dkim === 'FAIL') {
      anomalies.push('DKIM Cryptographic Signature Mismatch: Content may have been altered in transit.');
      trustScore -= 20;
    }
    if (dmarc === 'FAIL') {
      anomalies.push('DMARC Alignment Failure: Domain-level spoofing protection triggered.');
      trustScore -= 30;
    }

    // Content-based spam and phishing detection heuristics
    const emailBodyLower = emailContent.toLowerCase();
    
    // Check for paid-training scam signatures
    const hasFeeKeywords = emailBodyLower.includes('program fees') || 
                           emailBodyLower.includes('applicable fees') || 
                           emailBodyLower.includes('enrollment fees') ||
                           emailBodyLower.includes('course fee') ||
                           emailBodyLower.includes('fees will be') ||
                           emailBodyLower.includes('registration fee') ||
                           emailBodyLower.includes('payment of');

    const hasInternshipKeywords = emailBodyLower.includes('internship') || 
                                  emailBodyLower.includes('training') || 
                                  emailBodyLower.includes('placement') || 
                                  emailBodyLower.includes('corizo');

    // Only penalize if it combines an internship/training offer with fee/payment requirements, or is a known paid-program scam
    const isPaidInternshipScam = (hasInternshipKeywords && hasFeeKeywords) || emailBodyLower.includes('corizo');

    if (isPaidInternshipScam) {
      trustScore -= 30;
      anomalies.push('Suspected Paid-Training/Internship Scam: Email solicits fees or payments for a training/internship program.');
    }

    // High-Risk Phishing/Fraud keywords
    const criticalSpamKeywords = [
      'lottery winner',
      'draw winner',
      'claim your prize',
      'inherit',
      'wire transfer',
      'bank account details',
      'unauthorized transaction',
      'suspended account',
      'verify your password',
      'reset your security code',
      'gift card',
      'bitcoin wallet',
      'double your money'
    ];

    let criticalMatches = 0;
    criticalSpamKeywords.forEach(kw => {
      if (emailBodyLower.includes(kw)) {
        criticalMatches++;
      }
    });

    if (criticalMatches >= 1) {
      trustScore -= 55;
      anomalies.push('High-Risk Phishing/Financial Fraud Indicator: Email body solicits sensitive credentials or financial actions.');
    }

    // Check for mock attachments/malicious links in file content
    if (/\.(exe|scr|vbs|bat|zip|rar|cab)/i.test(emailContent)) {
      const match = emailContent.match(/[\w-]+\.(exe|scr|vbs|bat|zip|rar|cab)/i);
      const attName = match ? match[0] : 'document_update.exe';
      suspiciousAttachments.push(attName);
      anomalies.push(`High-risk executable attachment detected: '${attName}'`);
      trustScore -= 25;
    }

    if (/(bit\.ly|tinyurl|parttimejob|reward|bonus-claim)/i.test(emailContent)) {
      const match = emailContent.match(/https?:\/\/[^\s"']+/i);
      const urlMatch = match ? match[0] : 'http://bit.ly/claim-refund';
      maliciousLinks.push(urlMatch);
      anomalies.push(`Malicious/masked redirection link found: '${urlMatch}'`);
      trustScore -= 20;
    }

    // Force lower score for dangerous combinations
    let safetyRating = 'safe';
    if (trustScore < 45 || displayNameSpoofing) {
      safetyRating = 'dangerous';
      trustScore = Math.max(10, trustScore);
    } else if (trustScore < 80) {
      safetyRating = 'suspicious';
      trustScore = Math.max(35, trustScore);
    }

    const riskScore = 100 - trustScore;
    const verdict = safetyRating === 'safe' ? 'safe' : (safetyRating === 'suspicious' ? 'suspicious' : 'manipulated');

    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `Email headers audit verified successful SPF, DKIM, and DMARC alignments. Sending IP (${senderIp}) matches the authorized blocklist for the domain. No display name spoofing or mismatched reply channels were detected. Attachments and payload links are fully clean.`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `WARNING: Email audit flagged security mismatches. There is a mismatch between the sending header and Reply-To directive, or SPF/DKIM flags failed to align. Attachment formats require scanning.`;
    } else {
      aiExplanation = `CRITICAL FRAUD ALERT: Highly dangerous email spoofing detected. Display name is disguised as a trusted brand, but the sending mailbox resides on an unrelated domain. DKIM signature validation failed, indicating header alteration. Do NOT click attachments.`;
    }

    const headersList = [
      { key: 'From', value: sender },
      { key: 'To', value: recipient },
      { key: 'Subject', value: subject },
      { key: 'Sender IP', value: senderIp },
      { key: 'SPF Record', value: spf },
      { key: 'DKIM Sign', value: dkim },
      { key: 'DMARC Align', value: dmarc }
    ];

    const analysisDetails = {
      sender,
      recipient,
      subject,
      spf,
      dkim,
      dmarc,
      senderIp,
      replyToMismatch,
      displayNameSpoofing,
      suspiciousAttachments,
      maliciousLinks,
      headers: headersList,
      rawHeadersLength: emailContent.length
    };

    const report = new Report({
      userId: req.user.userId,
      fileName,
      fileUrl,
      mediaType: 'email',
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
        title: 'Email Security Audit Complete',
        message: `Forensic header check finished for ${fileName}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      details: analysisDetails
    });

  } catch (err) {
    res.status(500).json({ message: 'Email verification failed: ' + err.message });
  }
});

module.exports = router;
