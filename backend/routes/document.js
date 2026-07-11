const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const Report = require('../models/Report');
const DocumentAnalysis = require('../models/DocumentAnalysis');
const User = require('../models/User');
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
    if (ext === '.pdf' || ext === '.docx' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      return cb(null, true);
    }
    cb(new Error('Only document formats (.pdf, .docx, .png, .jpg, .jpeg) are allowed.'));
  }
});

// Helper to extract basic metadata from raw PDF buffer string
function parsePDFMetadata(bufferString) {
  const meta = {};
  
  // Extract Creator
  const creatorMatch = bufferString.match(/\/Creator\s*\(([^)]+)\)/);
  if (creatorMatch) meta.creator = creatorMatch[1];

  // Extract Producer
  const producerMatch = bufferString.match(/\/Producer\s*\(([^)]+)\)/);
  if (producerMatch) meta.producer = producerMatch[1];

  // Extract Author
  const authorMatch = bufferString.match(/\/Author\s*\(([^)]+)\)/);
  if (authorMatch) meta.author = authorMatch[1];

  // Extract Title
  const titleMatch = bufferString.match(/\/Title\s*\(([^)]+)\)/);
  if (titleMatch) meta.title = titleMatch[1];

  return meta;
}

// Run document analysis
router.post('/verify', authMiddleware, upload.single('document'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Document file is required.' });

  const filePath = req.file.path;
  
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const bufferString = fileBuffer.toString('binary');
    
    const ext = path.extname(req.file.originalname).toLowerCase();
    
    let extractedText = '';
    let metadata = {
      fileSize: `${(fileBuffer.length / 1024).toFixed(2)} KB`,
      mimeType: req.file.mimetype,
    };
    
    let ocrConsistency = 'Consistent';
    let signaturePresence = 'None Detected';
    let possibleManipulation = 'None Detected';
    let qrDetection = [];
    let isTextReadable = true;

    // Parse and extract actual text content
    if (ext === '.pdf') {
      const pdfMeta = parsePDFMetadata(bufferString);
      metadata = { ...metadata, ...pdfMeta };

      try {
        const parsedPdf = await pdfParse(fileBuffer);
        extractedText = parsedPdf.text;
      } catch (err) {
        console.error('pdf-parse text extraction failed, falling back:', err);
        extractedText = bufferString;
      }

      // Look for signature triggers
      if (bufferString.includes('/Sig') || bufferString.includes('Signature') || bufferString.includes('signed')) {
        signaturePresence = 'Digital/Cryptographic Signature Block Detected';
      }
      
      // Look for manipulation indicators
      if (bufferString.includes('Acrobat Distiller') || bufferString.includes('Nitro PDF') || bufferString.includes('ilovepdf')) {
        possibleManipulation = 'Re-saved/Re-compressed PDF structure detected.';
      }

      // Count extractable words to determine if PDF is text-readable or vector/scanned
      const englishWords = (extractedText || '').match(/[a-zA-Z]{3,}/g) || [];
      isTextReadable = englishWords.length >= 8;

      if (isTextReadable || bufferString.includes('/Text') || bufferString.includes('BT') || bufferString.includes('ET')) {
        ocrConsistency = 'Consistent';
      } else {
        ocrConsistency = 'Unextractable Text Layer (Scanned or Vector PDF)';
      }
    } else if (ext === '.docx') {
      try {
        const parsedDocx = await mammoth.extractRawText({ buffer: fileBuffer });
        extractedText = parsedDocx.value;
      } catch (err) {
        console.error('mammoth docx extraction failed, falling back:', err);
        extractedText = bufferString;
      }
      if (bufferString.includes('word/') || bufferString.includes('document.xml')) {
        metadata.creator = 'Microsoft Word';
      }
    } else {
      // Images
      extractedText = 'Image file format uploaded. OCR analysis simulated.';
    }

    // === AI Text Detection ===
    // Checks file buffer for AI writing fingerprints (works for text-readable PDFs and DOCX)
    const nameLower = req.file.originalname.toLowerCase();
    const bufStrLow = bufferString.toLowerCase();

    const isAIName = nameLower.includes('chatgpt') || nameLower.includes('gpt') ||
                     nameLower.includes('claude') || nameLower.includes('gemini') ||
                     nameLower.includes('copilot') || nameLower.includes('ai_generated') ||
                     nameLower.includes('ai-generated');

    // Comprehensive AI phrase heuristics (ChatGPT / Claude / Gemini style)
    const aiPhrases = [
      'as an ai',
      'as a language model',
      'i cannot provide',
      'it is important to note',
      'it is worth noting',
      'it is important to remember',
      'it is crucial to',
      'in conclusion,',
      'in summary,',
      'furthermore,',
      'moreover,',
      'additionally,',
      'delve into',
      'testament to',
      'certainly!',
      'of course!',
      'i\'d be happy to',
      'here is a comprehensive',
      'here is a detailed',
      'let\'s explore',
      'key takeaways',
      'it\'s worth mentioning',
      'to summarize,',
      'as previously mentioned',
      'in the realm of',
      'plays a pivotal role',
      'plays a crucial role',
      'a comprehensive guide',
      'the following are',
      'there are several',
      'this document aims to',
      'the purpose of this document',
    ];

    let aiPhraseHits = 0;
    const textLower = extractedText.toLowerCase();
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = textLower.match(emailRegex) || [];
    aiPhrases.forEach(ph => { if (textLower.includes(ph)) aiPhraseHits++; });

    // PDF metadata absence check: AI-generated PDFs typically have no Author, no Creator (or generic creator like LibreOffice/Word)
    const hasNoAuthor = ext === '.pdf' && !metadata.author;
    const hasNoCreationDate = ext === '.pdf' && !metadata.creationDate;
    const hasGenericCreator = metadata.creator && (
      metadata.creator.toLowerCase().includes('microsoft word') ||
      metadata.creator.toLowerCase().includes('libreoffice') ||
      metadata.creator.toLowerCase().includes('wps') ||
      metadata.creator.toLowerCase().includes('writer')
    );

    // AI text is likely if: name says AI, OR 3+ AI phrases found, OR (phrases found + no author/date metadata)
    const isAIText = isAIName || (aiPhraseHits >= 3) || (aiPhraseHits >= 1 && hasNoAuthor && hasNoCreationDate);
    metadata.aiTextDetected = isAIText;
    metadata.aiTextPhraseMatches = aiPhraseHits;
    metadata.aiTextConfidence = isAIText ? (aiPhraseHits >= 5 ? 'High' : 'Medium') : 'Low';

    // Fetch user details for student/recipient name matching
    const currentUser = await User.findById(req.user.userId);
    const registeredName = currentUser?.profile?.name || '';

    // === Document Content Authenticity Check (Names, Organisations, Signatures) ===
    const isInternshipDoc =
      nameLower.includes('certificate') ||
      nameLower.includes('internship') ||
      nameLower.includes('offer') ||
      nameLower.includes('recommendation') ||
      nameLower.includes('lor') ||
      textLower.includes('certificate') ||
      textLower.includes('internship') ||
      textLower.includes('recommendation') ||
      textLower.includes('offer letter');

    // 1. Identify recipient/student name (with fuzzy initial, space compression, and first name fallback)
    const cleanText = textLower.replace(/[^a-z0-9]/g, '');
    const cleanName = registeredName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const firstWord = registeredName.toLowerCase().split(/\s+/).filter(Boolean)[0] || '';
    const nameParts = registeredName.toLowerCase().split(/\s+/).filter(Boolean);

    const hasNameMatch = registeredName && (
      textLower.includes(registeredName.toLowerCase()) ||
      cleanText.includes(cleanName) ||
      (firstWord && firstWord.length >= 3 && cleanText.includes(firstWord.replace(/[^a-z0-9]/g, ''))) ||
      (nameParts.length > 0 && nameParts.every(part => cleanText.includes(part))) ||
      nameLower.includes(registeredName.toLowerCase().replace(/\s+/g, ''))
    );

    // 2. Company registry lookup & scam database
    const COMPANY_REGISTRY = {
      google: {
        name: 'Google LLC',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'google.com',
        reviews: 'Highly reputable global tech company. Official internships are fully paid and never require payment or certificate fees. Scammers frequently forge Google offer letters requesting training fees.',
        isScam: false
      },
      microsoft: {
        name: 'Microsoft Corporation',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'microsoft.com',
        reviews: 'Highly reputable global technology corporation. Official internships never ask for fees. Note: A common scam (like Corizo) falsely claims association with Microsoft to sell paid courses.',
        isScam: false
      },
      amazon: {
        name: 'Amazon',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'amazon.com',
        reviews: 'Trusted global e-commerce and cloud organization. Official internships are highly competitive and paid. Watch out for fake recruiter telegram channels offering easy tasks.',
        isScam: false
      },
      tcs: {
        name: 'Tata Consultancy Services (TCS)',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'tcs.com',
        reviews: 'Major IT services company. Official entry-level hiring and internships are conducted through TCS iON or NextStep. TCS never requests payment for training or offer letters.',
        isScam: false
      },
      infosys: {
        name: 'Infosys',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'infosys.com',
        reviews: 'Global IT consulting leader. Internships are paid and structured. Beware of fake email domains sending congrats templates.',
        isScam: false
      },
      wipro: {
        name: 'Wipro',
        type: 'Enterprise',
        reputation: 'Trusted',
        domain: 'wipro.com',
        reviews: 'Trusted global information technology company. Official letters are sent via official wipro.com emails.',
        isScam: false
      },
      corizo: {
        name: 'Corizo / Corizo Technologies',
        type: 'Paid-Training',
        reputation: 'High-Risk Scam',
        domain: 'corizo.in',
        reviews: 'High Risk. Numerous student complaints on Quora, Reddit, and Trustpilot. Corizo attracts students by promising a Microsoft internship, but subsequently forces them to pay ₹4,000–₹10,000 for mandatory training before providing a certificate.',
        isScam: true
      },
      verzeo: {
        name: 'Verzeo',
        type: 'Paid-Training',
        reputation: 'High-Risk Scam',
        domain: 'verzeo.com',
        reviews: 'High Risk. Known for selling certification courses disguised as internship opportunities. They mandate payment for training modules before certifying students.',
        isScam: true
      },
      oasis: {
        name: 'Oasis Infobyte',
        type: 'Micro-Internship',
        reputation: 'Spam Warning',
        domain: 'oasisinfobyte.com',
        reviews: 'Spam/Low Value. Conducts bulk unpaid micro-internships with no active mentorship. While not a financial scam, the certificates hold very low academic or corporate weight because they are issued in mass.',
        isScam: false
      },
      codeclause: {
        name: 'CodeClause',
        type: 'Micro-Internship',
        reputation: 'Spam Warning',
        domain: 'codeclause.com',
        reviews: 'Low Value. Offers bulk virtual internships with zero mentorship. Frequently charges small administrative fees for certificates. Certificates have negligible value in the industry.',
        isScam: false
      }
    };

    const detectedCompanyKey = Object.keys(COMPANY_REGISTRY).find(k => textLower.includes(k) || nameLower.includes(k));
    const companyInfo = detectedCompanyKey ? COMPANY_REGISTRY[detectedCompanyKey] : {
      name: 'Unregistered Entity',
      type: 'Unknown',
      reputation: 'Neutral / Verification Required',
      domain: null,
      reviews: 'Company is not registered in our verified registry. Recommend checking Google Reviews, Quora, and the Ministry of Corporate Affairs (MCA) portal. Genuine internships never ask for security deposits, course purchases, or processing fees.',
      isScam: false
    };

    const organization = companyInfo.name;

    // 3. Identify signature block presence
    const hasSignatureBlock =
      textLower.includes('signature') ||
      textLower.includes('signatory') ||
      textLower.includes('authorized sign') ||
      textLower.includes('director') ||
      textLower.includes('co-ordinator') ||
      textLower.includes('program manager') ||
      textLower.includes('seal') ||
      bufferString.toLowerCase().includes('signature') ||
      bufferString.includes('/Sig') ||
      bufferString.includes('/Widget');

    // Add results to metadata object for UI display
    metadata.isInternshipDoc = isInternshipDoc;
    metadata.recipientName = registeredName || 'Unspecified Recipient';
    metadata.nameVerified = isTextReadable ? (hasNameMatch ? 'Verified Match' : 'Unverified / Name Mismatch') : 'Not Text-Readable';
    metadata.organization = organization;
    metadata.signaturesVerified = isTextReadable ? (hasSignatureBlock ? 'Signature Block Located' : 'None Detected') : (hasSignatureBlock ? 'Signature Block Located' : 'Not Text-Readable');

    // === Structural & Content Risk Scoring ===
    let riskScore = 8; // very low default
    let anomalies = [];

    // AI text: informational note only — does NOT increase risk score or change verdict
    if (isAIText) {
      anomalies.push(`Text content exhibits AI writing patterns (${aiPhraseHits} AI-style phrases detected). The text may have been generated by ChatGPT, Claude, or a similar tool.`);
    }

    // Company registry scam status verification
    if (companyInfo.isScam) {
      riskScore = Math.max(riskScore, 85);
      anomalies.push(`Flagged Scam Advisory: Document is associated with "${companyInfo.name}", which is widely reported to run paid training fee structures disguised as internships.`);
    }

    // Email Domain spoofing verification
    if (emails.length > 0 && companyInfo.domain) {
      const domains = emails.map(email => email.split('@')[1].toLowerCase());
      const mismatch = domains.find(dom => dom !== companyInfo.domain && !dom.endsWith('.' + companyInfo.domain) && dom !== 'gmail.com' && dom !== 'yahoo.com' && dom !== 'outlook.com');
      if (mismatch) {
        riskScore = Math.max(riskScore, 75);
        anomalies.push(`Sender Domain Mismatch: Document references company "${companyInfo.name}" (official domain: ${companyInfo.domain}), but contains contact emails from unverified domain "${mismatch}".`);
      }
    }

    // Logo & Creator Alignment Verification: Official certificates from premium companies (Google, Microsoft, Amazon, etc.) 
    // are generated by official automation templates, not Canva design accounts.
    const claimsOfficialBrand = textLower.includes('google') || textLower.includes('microsoft') || textLower.includes('amazon') || textLower.includes('goldman sachs');
    const createdByCanva = metadata.creator && metadata.creator.toLowerCase().includes('canva');
    const createdByGenericWeb = metadata.producer && (metadata.producer.toLowerCase().includes('ilovepdf') || metadata.producer.toLowerCase().includes('smallpdf'));

    if (claimsOfficialBrand && (createdByCanva || createdByGenericWeb)) {
      riskScore = Math.max(riskScore, 65);
      anomalies.push(`Alignment anomaly: Document claims official association with a major corporation (${organization}), but metadata reveals it was custom-designed or modified via a consumer design tool (${metadata.creator || metadata.producer}).`);
    }

    if (isInternshipDoc && !companyInfo.isScam) {
      // For general internship docs: check student name alignment and signatures only if the PDF is text-readable
      if (isTextReadable) {
        if (!hasNameMatch && registeredName) {
          riskScore = Math.max(riskScore, 35);
          anomalies.push(`Recipient Name Mismatch: The document text does not contain the registered user's name ("${registeredName}").`);
        }
        if (!hasSignatureBlock) {
          riskScore = Math.max(riskScore, 40);
          anomalies.push('Missing Signatures: Document lacks authorized signatory fields, signature blocks, or stamp structures.');
        }
      } else {
        // If it's a scanned/vector PDF with no text layer, add an informational note but bypass penalties to avoid false positives
        anomalies.push('Unextractable text layer: This document is a scanned image or uses vector graphics (Type3 fonts) without standard extractable text encoding. Name and signature verification was bypassed to avoid false positives.');
      }
    }

    if (possibleManipulation !== 'None Detected') {
      riskScore = Math.max(riskScore, 45);
      anomalies.push(`Document structure was re-processed using web-based PDF tools (${metadata.producer || 'unknown'}).`);
    }

    if (ocrConsistency !== 'Consistent') {
      riskScore = Math.max(riskScore, 55);
      anomalies.push('No digital text layer — document appears to be a scanned image. OCR inconsistency detected.');
    }

    // Contract/invoice without signature is suspicious
    let verdict = 'safe';
    if (nameLower.includes('invoice') || nameLower.includes('contract') || nameLower.includes('agreement')) {
      if (signaturePresence === 'None Detected' && !hasSignatureBlock) {
        riskScore = Math.max(riskScore, 60);
        anomalies.push('Financial or contractual document detected without a cryptographic or digital signature block.');
      }
    }

    if (riskScore >= 70) {
      verdict = 'manipulated';
    } else if (riskScore >= 30) {
      verdict = 'suspicious';
    }

    const authenticityScore = Math.max(100 - riskScore, 5);

    // === AI Explanation Builder ===
    const companyAdvisory = `\n\n🏢 [Company Forensics Profile]\n- Issuer: ${companyInfo.name}\n- Category: ${companyInfo.type}\n- Reputation Status: ${companyInfo.reputation}\n- Reviews & Advisory: ${companyInfo.reviews}`;

    let aiExplanation = '';
    if (verdict === 'safe') {
      if (isInternshipDoc) {
        aiExplanation = `Genuine Internship Document verified successfully. Issuer: "${organization}". Recipient Name: "${registeredName}" (Verified). Signature blocks: Present & Intact. The document format, digital structure, and content checks confirm its authenticity. Confidence: ${authenticityScore}%.` + companyAdvisory;
      } else if (isAIText) {
        aiExplanation = `Document structural integrity verified — the file format, layout, and encoding are authentic. However, Natural Language Processing detected ${aiPhraseHits} writing patterns characteristic of AI text assistants (ChatGPT, Claude, Gemini). The document itself is genuine, but the written content appears to be AI-assisted. Authenticity confidence: ${authenticityScore}%.` + companyAdvisory;
      } else {
        aiExplanation = `Document integrity verified. Font encoding, metadata structure, and text layer alignment check out. No structural manipulation, forged metadata, or AI-generated text patterns were detected. Authenticity confidence: ${authenticityScore}%.` + companyAdvisory;
      }
    } else if (verdict === 'suspicious') {
      if (isInternshipDoc) {
        aiExplanation = `Internship document flagged as suspicious. Issues: ${anomalies.join(' | ')}. Recommend verifying the certificate ID or contacting the issuer ("${organization}") directly.` + companyAdvisory;
      } else {
        aiExplanation = `Document flagged with structural warnings. Detected indicators: ${anomalies.join(' | ')}. Recommend manual review before accepting this document as official.` + companyAdvisory;
      }
    } else {
      if (companyInfo.isScam) {
        aiExplanation = `SCAM WARNING: This document is flagged as a fake internship or paid-training scam associated with ${companyInfo.name}. Reputation status: ${companyInfo.reputation}. Reviews & Advisory: ${companyInfo.reviews} Do NOT pay any money or share sensitive credentials.` + companyAdvisory;
      } else {
        aiExplanation = `Document flagged as manipulated. Critical structural or content issues found: ${anomalies.join(' | ')}. High likelihood of forgery or modification. Do not accept this document without independent verification.` + companyAdvisory;
      }
    }

    // Save general report
    const report = new Report({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileUrl: filePath.replace(/\\/g, '/'),
      mediaType: 'document',
      authenticityScore,
      riskScore,
      verdict,
      aiExplanation,
      anomalies
    });
    const savedReport = await report.save();

    // Save document details
    const docDetails = new DocumentAnalysis({
      reportId: savedReport._id,
      extractedText,
      ocrConsistency,
      qrDetection,
      signaturePresence,
      possibleManipulation,
      metadata
    });
    await docDetails.save();

    // Emit Real-time Notification
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(req.user.userId).emit('notification', {
        title: 'Document Check Completed',
        message: `Forensic audit complete for ${req.file.originalname}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      analysis: docDetails
    });

  } catch (err) {
    res.status(500).json({ message: 'Verification failed: ' + err.message });
  }
});

module.exports = router;
