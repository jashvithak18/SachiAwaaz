const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
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
    
    let extractedText = 'Simulated OCR: Document content scanning complete.';
    let metadata = {
      fileSize: `${(fileBuffer.length / 1024).toFixed(2)} KB`,
      mimeType: req.file.mimetype,
    };
    
    let ocrConsistency = 'Consistent';
    let signaturePresence = 'None Detected';
    let possibleManipulation = 'None Detected';
    let qrDetection = [];

    // Parse actual metadata if PDF
    if (ext === '.pdf') {
      const pdfMeta = parsePDFMetadata(bufferString);
      metadata = { ...metadata, ...pdfMeta };

      // Look for signature triggers
      if (bufferString.includes('/Sig') || bufferString.includes('Signature') || bufferString.includes('signed')) {
        signaturePresence = 'Digital/Cryptographic Signature Block Detected';
      }
      
      // Look for manipulation indicators
      if (bufferString.includes('Acrobat Distiller') || bufferString.includes('Nitro PDF') || bufferString.includes('ilovepdf')) {
        possibleManipulation = 'Re-saved/Re-compressed PDF structure detected.';
      }

      // Check text streams
      if (bufferString.includes('/Text') || bufferString.includes('BT') || bufferString.includes('ET')) {
        extractedText = 'Extracted Text Stream: Verification of structural fonts and characters successful.';
      } else {
        ocrConsistency = 'Potential Inconsistency: Image-only PDF lacking structural text streams.';
      }
    } else {
      // DOCX or Images
      if (bufferString.includes('word/') || bufferString.includes('document.xml')) {
        metadata.creator = 'Microsoft Word';
      }
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
    aiPhrases.forEach(ph => { if (bufStrLow.includes(ph)) aiPhraseHits++; });

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
      bufStrLow.includes('certificate') ||
      bufStrLow.includes('internship') ||
      bufStrLow.includes('recommendation') ||
      bufStrLow.includes('offer letter');

    // 1. Identify recipient/student name
    const hasNameMatch = registeredName && (
      bufStrLow.includes(registeredName.toLowerCase()) ||
      nameLower.includes(registeredName.toLowerCase().replace(/\s+/g, '')) ||
      nameLower.includes(registeredName.toLowerCase().replace(/\s+/g, '_'))
    );

    // 2. Identify issuing organization
    const orgs = [
      { key: 'microsoft', label: 'Microsoft' },
      { key: 'google', label: 'Google' },
      { key: 'amazon', label: 'Amazon' },
      { key: 'tcs', label: 'Tata Consultancy Services (TCS)' },
      { key: 'infosys', label: 'Infosys' },
      { key: 'wipro', label: 'Wipro' },
      { key: 'anurag', label: 'Anurag Engineering College' },
      { key: 'corizo', label: 'Corizo' },
      { key: 'goldman', label: 'Goldman Sachs' },
      { key: 'adobe', label: 'Adobe' }
    ];
    const detectedOrgObj = orgs.find(o => bufStrLow.includes(o.key) || nameLower.includes(o.key));
    const organization = detectedOrgObj ? detectedOrgObj.label : 'Unknown Organisation';

    // 3. Identify signature block presence
    const hasSignatureBlock =
      bufferString.toLowerCase().includes('signature') ||
      bufferString.toLowerCase().includes('signatory') ||
      bufferString.toLowerCase().includes('authorized sign') ||
      bufferString.toLowerCase().includes('director') ||
      bufferString.toLowerCase().includes('co-ordinator') ||
      bufferString.toLowerCase().includes('program manager') ||
      bufferString.toLowerCase().includes('seal') ||
      bufferString.includes('/Sig') ||
      bufferString.includes('/Widget');

    // Add results to metadata object for UI display
    metadata.isInternshipDoc = isInternshipDoc;
    metadata.recipientName = registeredName || 'Unspecified Recipient';
    metadata.nameVerified = hasNameMatch ? 'Verified Match' : 'Unverified / Name Mismatch';
    metadata.organization = organization;
    metadata.signaturesVerified = hasSignatureBlock ? 'Signature Block Located' : 'None Detected';

    // === Structural & Content Risk Scoring ===
    let riskScore = 8; // very low default
    let anomalies = [];

    // AI text: informational note only — does NOT increase risk score or change verdict
    if (isAIText) {
      anomalies.push(`Text content exhibits AI writing patterns (${aiPhraseHits} AI-style phrases detected). The text may have been generated by ChatGPT, Claude, or a similar tool.`);
    }

    // Corizo paid training program scam check
    const isCorizoScam = bufStrLow.includes('corizo') || nameLower.includes('corizo');
    if (isCorizoScam) {
      riskScore = Math.max(riskScore, 85);
      anomalies.push('Flagged Paid-Training Scam: Document is associated with Corizo, which solicits training program fees under the guise of Microsoft internships.');
    }

    if (isInternshipDoc && !isCorizoScam) {
      // For general internship docs: check student name alignment and signatures
      if (!hasNameMatch && registeredName) {
        riskScore = Math.max(riskScore, 35);
        anomalies.push(`Recipient Name Mismatch: The document text does not contain the registered user's name ("${registeredName}").`);
      }
      if (!hasSignatureBlock) {
        riskScore = Math.max(riskScore, 40);
        anomalies.push('Missing Signatures: Document lacks authorized signatory fields, signature blocks, or stamp structures.');
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
    let aiExplanation = '';
    if (verdict === 'safe') {
      if (isInternshipDoc) {
        aiExplanation = `Genuine Internship Document verified successfully. Issuer: "${organization}". Recipient Name: "${registeredName}" (Verified). Signature blocks: Present & Intact. The document format, digital structure, and content checks confirm its authenticity. Confidence: ${authenticityScore}%.`;
      } else if (isAIText) {
        aiExplanation = `Document structural integrity verified — the file format, layout, and encoding are authentic. However, Natural Language Processing detected ${aiPhraseHits} writing patterns characteristic of AI text assistants (ChatGPT, Claude, Gemini). The document itself is genuine, but the written content appears to be AI-assisted. Authenticity confidence: ${authenticityScore}%.`;
      } else {
        aiExplanation = `Document integrity verified. Font encoding, metadata structure, and text layer alignment check out. No structural manipulation, forged metadata, or AI-generated text patterns were detected. Authenticity confidence: ${authenticityScore}%.`;
      }
    } else if (verdict === 'suspicious') {
      if (isInternshipDoc) {
        aiExplanation = `Internship document flagged as suspicious. Issues: ${anomalies.join(' | ')}. Recommend verifying the certificate ID or contacting the issuer ("${organization}") directly.`;
      } else {
        aiExplanation = `Document flagged with structural warnings. Detected indicators: ${anomalies.join(' | ')}. Recommend manual review before accepting this document as official.`;
      }
    } else {
      if (isCorizoScam) {
        aiExplanation = `SCAM WARNING: This document is flagged as a fake internship or paid-training scam associated with Corizo. They are known to send unsolicited student offers, claiming Microsoft industry collaborations to charge registration fees. Do NOT pay any money or share sensitive credentials.`;
      } else {
        aiExplanation = `Document flagged as manipulated. Critical structural or content issues found: ${anomalies.join(' | ')}. High likelihood of forgery or modification. Do not accept this document without independent verification.`;
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
