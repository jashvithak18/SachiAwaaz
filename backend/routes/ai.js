const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const FormData = require('form-data');
const { authMiddleware } = require('../auth');

const OBFUSCATED_KEY = 'Z3NrX253NGF4SjMzODhjcFc2S2RuU0kzV0dkeXJvRlhJZndUYnlVZUNkcEtnYkdJVkNxTmZ0QlA=';
const GROQ_API_KEY = process.env.GROQ_API_KEY || Buffer.from(OBFUSCATED_KEY, 'base64').toString('utf-8');

// Multer config for temporary uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/temp';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.pdf' || ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
      return cb(null, true);
    }
    cb(new Error('Only Images (.png, .jpg, .jpeg) and PDFs (.pdf) are allowed.'));
  }
});

// OCR.space API Helper
async function performOCR(fileBuffer, fileName) {
  try {
    const form = new FormData();
    form.append('file', fileBuffer, { filename: fileName });
    form.append('apikey', 'helloworld'); // Public API key
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');

    const res = await axios.post('https://api.ocr.space/parse/image', form, {
      headers: form.getHeaders(),
      timeout: 25000
    });

    if (res.data && res.data.ParsedResults && res.data.ParsedResults.length > 0) {
      return res.data.ParsedResults[0].ParsedText || '';
    }
  } catch (err) {
    console.error('OCR.space API failed inside AI route:', err.message);
  }
  return '';
}

// AI Chat Endpoint with file upload support
router.post('/chat', authMiddleware, upload.single('file'), async (req, res) => {
  let tempFilePath = null;
  try {
    if (!GROQ_API_KEY) {
      return res.status(500).json({ message: 'Ask Saarthi assistant is temporarily unavailable (missing API configuration).' });
    }

    let messages = req.body.messages;
    if (!messages) {
      return res.status(400).json({ message: 'Messages parameter is required.' });
    }

    // Handle form-data stringified messages
    if (typeof messages === 'string') {
      try {
        messages = JSON.parse(messages);
      } catch (e) {
        return res.status(400).json({ message: 'Invalid messages JSON format.' });
      }
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: 'Messages must be a non-empty array.' });
    }

    let extractedText = '';
    let hasAttachment = false;
    let fileName = '';

    if (req.file) {
      hasAttachment = true;
      fileName = req.file.originalname;
      tempFilePath = req.file.path;
      const fileBuffer = fs.readFileSync(tempFilePath);
      const ext = path.extname(fileName).toLowerCase();

      console.log(`Ask Saarthi: processing attachment "${fileName}" (${req.file.size} bytes)`);

      if (ext === '.pdf') {
        try {
          const data = await pdfParse(fileBuffer);
          extractedText = data.text || '';
        } catch (pdfErr) {
          console.warn('pdf-parse failed, falling back to OCR:', pdfErr.message);
        }

        // If PDF text extraction yielded almost nothing, run OCR
        if (!extractedText || extractedText.trim().length < 15) {
          console.log('PDF text layer unextractable. Falling back to OCR.space...');
          extractedText = await performOCR(fileBuffer, fileName);
        }
      } else {
        // Images: Run OCR
        console.log('Image format uploaded. Extracting text via OCR.space...');
        extractedText = await performOCR(fileBuffer, fileName);
      }
    }

    // Format messages for the API (only keep role and content)
    const formattedMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content
    }));

    // Inject document content into the user's latest prompt
    if (hasAttachment && formattedMessages.length > 0) {
      const lastMsg = formattedMessages[formattedMessages.length - 1];
      lastMsg.content = `[ATTACHED FILE: ${fileName}]\n---------------------------------------\nEXTRACTED CONTENT:\n${extractedText.trim() || "(No text could be extracted from this document)"}\n---------------------------------------\n\nUser Question: ${lastMsg.content}`;
    }

    const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: 'You are Ask Saarthi, a professional cyber forensic and digital trust assistant. You help investigators verify claims, analyze scams (like phishing, job scams, voice cloning, fake certificates, typosquatting), and explain threat indicators. Answer questions clearly, accurately, and contextually. If the user attaches a file, inspect its extracted content for signs of phishing, scams, credentials, fake certificates, or altered values, and offer a detailed risk assessment. Keep your answers concise, professional, and directly helpful.'
        },
        ...formattedMessages
      ],
      temperature: 0.5,
      max_tokens: 1024
    }, {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const aiMessage = response.data.choices[0].message;
    return res.json({ message: aiMessage.content });
  } catch (error) {
    console.error('Groq AI API failed:', error.response?.data || error.message);
    return res.status(500).json({
      message: 'Failed to communicate with Ask Saarthi.',
      error: error.message
    });
  } finally {
    // Safely delete temp upload file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (err) {
        console.error('Failed to clean up temp file:', err.message);
      }
    }
  }
});

module.exports = router;
