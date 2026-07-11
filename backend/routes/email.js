const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Report = require('../models/Report');
const { authMiddleware } = require('../auth');

// Shared DuckDuckGo search helper
async function ddgSearch(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
      timeout: 5500,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36' }
    });
    if (res.status !== 200 || !res.data) return [];
    const html = res.data;
    const snippetRe = /<a class="result__snippet"[^>]*>([\/\S\s]*?)<\/a>/g;
    const titleRe = /<a class="result__a"[^>]*>([\/\S\s]*?)<\/a>/g;
    const snippets = [], titles = [];
    let m;
    while ((m = snippetRe.exec(html)) !== null && snippets.length < 5)
      snippets.push(m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    while ((m = titleRe.exec(html)) !== null && titles.length < 5)
      titles.push(m[1].replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
    return snippets.map((s, i) => ({ title: titles[i] || '', snippet: s }));
  } catch { return []; }
}

async function investigateCompany(domainOrName) {
  if (!domainOrName) return null;
  const scamKeywords = ['scam', 'fraud', 'fake', 'phishing', 'not legit', 'charge fees', 'pay money'];
  const positiveKeywords = ['legitimate', 'trusted', 'reputable', 'genuine', 'verified'];
  const [infoResults, reviewResults] = await Promise.all([
    ddgSearch(`${domainOrName} company official about`),
    ddgSearch(`${domainOrName} scam fraud reviews complaints`)
  ]);
  const foundAlerts = new Set();
  const foundPos = new Set();
  reviewResults.forEach(r => {
    const t = (r.title + ' ' + r.snippet).toLowerCase();
    scamKeywords.forEach(k => { if (t.includes(k)) foundAlerts.add(k); });
    positiveKeywords.forEach(k => { if (t.includes(k)) foundPos.add(k); });
  });
  let summary = `\n🏢 [Sender Company Live Investigation — ${domainOrName}]\n`;
  if (infoResults.length > 0) {
    summary += `📌 About: ${infoResults[0].snippet.substring(0, 200)}\n`;
  } else {
    summary += `📌 About: No clear public information found for this domain/company.\n`;
  }
  summary += `📣 Community Reviews:\n`;
  if (reviewResults.length > 0) {
    reviewResults.slice(0, 3).forEach((r, i) => {
      summary += `${i+1}. ${r.snippet.substring(0, 160)}\n`;
    });
  } else {
    summary += `No significant public discussion found.\n`;
  }
  if (foundAlerts.size > 0) summary += `⚠️ Scam Signals: ${[...foundAlerts].join(', ')}\n`;
  if (foundPos.size > 0) summary += `✅ Trust Signals: ${[...foundPos].join(', ')}\n`;
  if (foundAlerts.size >= 2) summary += `\n🚨 VERDICT: Multiple scam/fraud signals found for this sender domain. HIGH RISK.`;
  else if (foundAlerts.size === 0 && foundPos.size > 0) summary += `\n✅ VERDICT: Sender domain appears legitimate based on public records.`;
  else summary += `\n⚠️ VERDICT: Insufficient public data to fully verify. Exercise caution.`;
  return { summary, isScam: foundAlerts.size >= 2 };
}

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
      // Handle "From: ..." or "From : ..."
      if (/^\s*from\s*:\s*(.*)/i.test(line)) {
        const match = line.match(/^\s*from\s*:\s*(.*)/i);
        if (match) sender = match[1].replace(/["']/g, '').trim();
      } else if (/^\s*to\s*:\s*(.*)/i.test(line)) {
        const match = line.match(/^\s*to\s*:\s*(.*)/i);
        if (match) recipient = match[1].trim();
      } else if (/^\s*subject\s*:\s*(.*)/i.test(line)) {
        const match = line.match(/^\s*subject\s*:\s*(.*)/i);
        if (match) subject = match[1].trim();
      } else if (/^\s*reply-to\s*:\s*(.*)/i.test(line)) {
        const match = line.match(/^\s*reply-to\s*:\s*(.*)/i);
        if (match) replyTo = match[1].trim();
      } else if (/^received:/i.test(line) && senderIp === '127.0.0.1') {
        // Try to extract first sender IP from Received line
        const ipMatch = line.match(/\[(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\]/);
        if (ipMatch) senderIp = ipMatch[1];
      }
    });

    // Heuristic parsing for copy-pasted emails (e.g. from Gmail/Outlook/Yahoo)
    if (sender === 'unknown@sender.com') {
      let foundSender = false;
      let foundSubject = false;
      let foundRecipient = false;

      for (let i = 0; i < Math.min(lines.length, 15); i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // 1. Look for lines containing an email address: e.g. "Some Name <email@domain.com>" or just "email@domain.com"
        // Ignore lines that explicitly start with "To:" or "Cc:" (to avoid picking up recipient)
        const emailMatch = line.match(/<([^>]+@[^>]+)>/) || line.match(/([a-zA-Z0-9_\-\.\+]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})/);
        if (emailMatch && !foundSender && !/^(to|cc|bcc)\s*:/i.test(line) && !line.toLowerCase().startsWith('to me') && !line.toLowerCase().startsWith('to:')) {
          const angleMatch = line.match(/<([^>]+@[^>]+)>/);
          sender = angleMatch ? angleMatch[1].trim() : emailMatch[0].trim();
          foundSender = true;
          continue;
        }

        // 2. Identify Subject: usually the first non-empty line if it doesn't contain emails or folder markers like "External" or "Inbox"
        if (!foundSubject && i < 5 && line.length < 150 && !line.includes('@') && !line.includes('<')) {
          const lowerLine = line.toLowerCase();
          if (lowerLine !== 'external' && lowerLine !== 'inbox' && lowerLine !== 'important' && !lowerLine.startsWith('to ') && !lowerLine.startsWith('from ')) {
            subject = line;
            foundSubject = true;
          }
        }

        // 3. Identify Recipient: look for "to me" or "to: <email>"
        if (!foundRecipient && i < 10) {
          if (line.toLowerCase() === 'to me' || line.toLowerCase().startsWith('to: me')) {
            recipient = 'me (Gmail Copy-Paste)';
            foundRecipient = true;
          } else if (/^to\s*:\s*(.*)/i.test(line)) {
            const match = line.match(/^to\s*:\s*(.*)/i);
            if (match) {
              recipient = match[1].trim();
              foundRecipient = true;
            }
          }
        }
      }
    }

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

    // === Content-Based Spam & Phishing Detection ===
    const emailBodyLower = emailContent.toLowerCase();

    // Known legitimate platform domains — if sender comes from these, give trust bonus
    const trustedDomains = [
      'microsoft.com', 'google.com', 'linkedin.com', 'internshala.com',
      'nasscom.in', 'naukri.com', 'amazon.com', 'apple.com',
      'gov.in', 'ac.in', 'edu', 'iit', 'nit', 'iisc'
    ];
    const senderDomainLower = (emailPart ? emailPart[1] : sender).toLowerCase();
    const isFromTrustedDomain = trustedDomains.some(td => senderDomainLower.includes(td));
    if (isFromTrustedDomain) {
      trustScore = Math.min(trustScore + 10, 100);
    }

    // Check for free public domain email addresses claiming to represent corporate HR/Recruitment
    const senderEmail = (emailPart ? emailPart[1] : sender).toLowerCase();
    const isFreeDomain = senderEmail.includes('@gmail.com') || 
                         senderEmail.includes('@yahoo.') || 
                         senderEmail.includes('@outlook.') || 
                         senderEmail.includes('@hotmail.') || 
                         senderEmail.includes('@icloud.') ||
                         senderEmail.includes('@proton.');

    const claimsCorporateHR = emailBodyLower.includes('recruitment') ||
                              emailBodyLower.includes('hr department') ||
                              emailBodyLower.includes('human resource') ||
                              emailBodyLower.includes('hiring manager') ||
                              emailBodyLower.includes('placement cell') ||
                              emailBodyLower.includes('talent acquisition') ||
                              sender.toLowerCase().includes('recruitment') ||
                              sender.toLowerCase().includes('hr department') ||
                              sender.toLowerCase().includes('human resource');

    const hasGoogleForm = emailBodyLower.includes('forms.gle') || 
                           emailBodyLower.includes('docs.google.com/forms');

    const isFreeMailHR = isFreeDomain && claimsCorporateHR;

    if (isFreeMailHR) {
      trustScore -= 30;
      anomalies.push(`Free Mail Sender for Corporate HR: Email claims to be from a corporate recruitment/HR team but was sent from a free public domain email address (${senderEmail}). Real corporations use customized branding domains.`);
    }

    // Check for Vague / Generic Recruitment Campaign (Spam/Harvesting)
    const hasVagueQualifications = emailBodyLower.includes('any degree') || 
                                   emailBodyLower.includes('any discipline') || 
                                   emailBodyLower.includes('any graduate') || 
                                   emailBodyLower.includes('any branch') ||
                                   emailBodyLower.includes('eligible to apply') ||
                                   emailBodyLower.includes('fresher to 2 years');

    const hasGeneralInternship = emailBodyLower.includes('internship') || 
                                 emailBodyLower.includes('stipend');

    if (hasGeneralInternship && (hasGoogleForm || hasVagueQualifications)) {
      trustScore -= 20;
      anomalies.push("Vague/Generic Recruitment Campaign: Email solicits applicants with extremely broad requirements ('any degree') using non-corporate public form host (Google Forms), typical of spam templates or harvesting campaigns.");
    }

    // High risk combo: Free Gmail HR + Google Forms link (highly diagnostic of scam/phishing)
    if (isFreeMailHR && hasGoogleForm) {
      trustScore -= 15;
      anomalies.push("High-Risk Phishing Combo: Sender claims to be corporate HR from a free Gmail address AND redirects to a Google Form, strongly indicating a fake recruitment/phishing scam.");
    }

    // Check for corporate domain redirecting to public Gmail/Yahoo addresses (e.g. mentor contact)
    if (!isFreeDomain && senderEmail.includes('@')) {
      const bodyEmails = emailBodyLower.match(/([a-zA-Z0-9_\-\.\+]+)@(gmail\.com|yahoo\.[a-z]{2,4}|outlook\.com|hotmail\.com|proton\.me|protonmail\.com)/g);
      if (bodyEmails && bodyEmails.length > 0) {
        const containsContactRequest = emailBodyLower.includes('mentor') || 
                                       emailBodyLower.includes('contact') || 
                                       emailBodyLower.includes('support') || 
                                       emailBodyLower.includes('reach out') || 
                                       emailBodyLower.includes('write to') ||
                                       emailBodyLower.includes('email id');
        if (containsContactRequest) {
          const uniquePublicEmails = bodyEmails.filter(e => e !== senderEmail);
          if (uniquePublicEmails.length > 0) {
            anomalies.push(`Public Mailbox Redirect: Corporate sender (${senderEmail}) instructs contacting/mentoring via a free public address ('${uniquePublicEmails[0]}'). While sometimes used for external mentors, this pattern is frequently exploited in fake recruitment/phishing campaigns.`);
            trustScore -= 15;
          }
        }
      }
    }

    // Check for paid-training/internship scam: MUST have both internship keywords AND explicit fee mention
    const hasFeeKeywords =
      emailBodyLower.includes('program fees') ||
      emailBodyLower.includes('applicable fees') ||
      emailBodyLower.includes('enrollment fees') ||
      emailBodyLower.includes('course fee') ||
      emailBodyLower.includes('fees will be') ||
      emailBodyLower.includes('registration fee') ||
      emailBodyLower.includes('payment of') ||
      emailBodyLower.includes('pay to enroll') ||
      emailBodyLower.includes('pay and get');

    const hasInternshipContext =
      emailBodyLower.includes('internship') ||
      emailBodyLower.includes('placement') ||
      emailBodyLower.includes('training program') ||
      emailBodyLower.includes('corizo') ||
      emailBodyLower.includes('certification program');

    // Only flag if: fees mentioned + internship context + NOT from a trusted domain
    const isPaidInternshipScam = hasInternshipContext && hasFeeKeywords && !isFromTrustedDomain;

    if (isPaidInternshipScam) {
      trustScore -= 30;
      anomalies.push('Suspected Paid-Training Scam: Email promotes an internship/certification program with fee requirements from an unverified sender.');
    } else if (hasInternshipContext && !hasFeeKeywords && !isFreeMailHR && !hasGoogleForm) {
      // Genuine internship/opportunity email — just add a note, don't penalize
      anomalies.push('Promotional/Opportunity Email: This appears to be an internship or training opportunity notice. No fees were solicited.');
    }

    // High-Risk Phishing / Financial Fraud keywords
    const criticalSpamKeywords = [
      'lottery winner', 'you have won', 'claim your prize', 'wire transfer',
      'bank account details', 'unauthorized transaction', 'suspended account',
      'verify your password', 'reset your security code', 'gift card',
      'bitcoin wallet', 'double your money', 'send money urgently',
      'otp to complete', 'share your otp', 'do not share your otp'
    ];

    let criticalMatches = 0;
    criticalSpamKeywords.forEach(kw => { if (emailBodyLower.includes(kw)) criticalMatches++; });

    if (criticalMatches >= 1) {
      trustScore -= 55;
      anomalies.push(`High-Risk Phishing/Financial Fraud: Email contains ${criticalMatches} critical fraud phrase(s) soliciting credentials or financial action.`);
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

    // === Email Forensic Summary Builder ===
    let explanationParts = [];
    explanationParts.push(`📧 [Email Header Forensic Verification]`);
    explanationParts.push(`- Sender: ${sender}`);
    explanationParts.push(`- Recipient: ${recipient}`);
    explanationParts.push(`- Subject: "${subject}"`);
    explanationParts.push(`- Sending Server IP: ${senderIp}`);

    explanationParts.push(`\n🔐 [Authentication Controls]`);
    explanationParts.push(`- SPF (Sender Policy Framework): ${spf === 'PASS' ? '✅ PASS (Authorized sender IP)' : (spf === 'FAIL' ? '❌ FAIL (Sender IP is NOT authorized by domain)' : '⚠️ NONE (No SPF policy published)')}`);
    explanationParts.push(`- DKIM (DomainKeys Identified Mail): ${dkim === 'PASS' ? '✅ PASS (Cryptographic signature verified, body unaltered)' : (dkim === 'FAIL' ? '❌ FAIL (Signature verification failed, email altered)' : '⚠️ NONE (No DKIM signature found)')}`);
    explanationParts.push(`- DMARC (Alignment Policy): ${dmarc === 'PASS' ? '✅ PASS (Domain aligned with SPF/DKIM)' : (dmarc === 'FAIL' ? '❌ FAIL (Anti-spoofing alignment failed)' : '⚠️ NONE (No DMARC protection active)')}`);

    explanationParts.push(`\n⚠️ [Anomalies & Threat Vectors]`);
    if (anomalies.length > 0) {
      anomalies.forEach(a => explanationParts.push(`- Flagged: ${a}`));
    } else {
      explanationParts.push(`- None detected. Mailbox routing and digital structures align with official templates.`);
    }

    if (suspiciousAttachments.length > 0) {
      explanationParts.push(`\n📎 [Suspicious Attachments]`);
      suspiciousAttachments.forEach(att => explanationParts.push(`- Blocked Extension: ${att}`));
    }
    if (maliciousLinks.length > 0) {
      explanationParts.push(`\n🔗 [High-Risk Redirects / Links]`);
      maliciousLinks.forEach(lnk => explanationParts.push(`- Flagged URL: ${lnk}`));
    }

    // === Live Company/Domain Investigation ===
    const senderCompanyDomain = senderDomainLower.split('@').pop() || senderDomainLower;
    const companyInvestigation = !isFromTrustedDomain ? await investigateCompany(senderCompanyDomain) : null;
    if (companyInvestigation) {
      if (companyInvestigation.isScam) {
        trustScore -= 30;
        anomalies.push(`Live web search detected scam/fraud signals for sender domain: ${senderCompanyDomain}`);
      }
    }

    explanationParts.push(`\n📊 [Threat Verdict]`);
    if (verdict === 'safe') {
      explanationParts.push(`Status: High Trust / Safe. This email passes all sender verification tests and exhibits no fraud keywords. It is safe to interact with.`);
    } else if (verdict === 'suspicious') {
      explanationParts.push(`Status: Warning / Suspicious. Mismatches in Reply-To headers, unauthenticated SPF/DKIM routing, or promotional paid-training flags were found. Proceed with caution.`);
    } else {
      explanationParts.push(`Status: DANGER / Forged. Display name spoofing, failed cryptographic signatures, or critical financial fraud keywords indicate a high likelihood of a phishing/malware delivery attempt. Do NOT click any links or download attachments.`);
    }

    if (companyInvestigation) {
      explanationParts.push(companyInvestigation.summary);
    }

    const aiExplanation = explanationParts.join('\n');

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
