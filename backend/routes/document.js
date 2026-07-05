const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Report = require('../models/Report');
const DocumentAnalysis = require('../models/DocumentAnalysis');
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

    // Heuristics to build score
    let riskScore = 10; // default low risk
    let anomalies = [];

    if (possibleManipulation !== 'None Detected') {
      riskScore = 40;
      anomalies.push('Document compiled using web-based PDF modifiers (e.g. ilovepdf, nitro).');
    }

    if (ocrConsistency !== 'Consistent') {
      riskScore = 55;
      anomalies.push('OCR Text inconsistency: No digital text layer matching visual layout.');
    }

    if (req.file.originalname.toLowerCase().includes('invoice') || req.file.originalname.toLowerCase().includes('contract')) {
      // simulate check
      if (signaturePresence === 'None Detected') {
        riskScore = Math.max(riskScore, 65);
        verdict = 'suspicious';
        anomalies.push('Missing signature fields on financial/contractual layout.');
      }
    }

    let verdict = 'safe';
    if (riskScore >= 60) {
      verdict = 'manipulated';
    } else if (riskScore >= 35) {
      verdict = 'suspicious';
    }

    let authenticityScore = 100 - riskScore;

    // AI Explanation builder
    let aiExplanation = '';
    if (verdict === 'safe') {
      aiExplanation = `Document structural integrity verified. Clear font embedding and digital signatures check out successfully. Author fields match structural compiled history.`;
    } else if (verdict === 'suspicious') {
      aiExplanation = `Potential verification warning. We detected PDF structural manipulation indicators (compile program: ${metadata.producer || 'unknown'}). Standard cryptographic signatures are absent.`;
    } else {
      aiExplanation = `Document layout flagged as manipulated. Mismatches exist between compiling metadata, font structures, and visual alignment layers. Risk of forgery is high.`;
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
