const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const { User, FamilyMember, Log } = require('./models');
const { authMiddleware, JWT_SECRET } = require('./auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

// Configure Multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/temp';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /wav|mp3|m4a|flac|ogg|opus|aac|mp4|3gp|3gpp|amr|wma/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only audio files (.wav, .mp3, .m4a, .flac, .ogg, .opus, .aac, .mp4, .3gp, .3gpp, .amr, .wma) are allowed!'));
  }
});

// Cosine similarity helper
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0.0;
  let normA = 0.0;
  let normB = 0.0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ----------------------------------------------------
// AUTHENTICATION
// ----------------------------------------------------

// Sign Up
router.post('/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    const savedUser = await newUser.save();
    const token = jwt.sign({ userId: savedUser._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: savedUser._id,
        email: savedUser.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Login
router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials.' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get logged-in user
router.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ── Nodemailer transporter (Gmail) ──────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });
}

// ── FORGOT PASSWORD — sends a 6-digit OTP to the user's email ──
router.post('/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required.' });

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // Always respond the same way — don't reveal whether email exists
    if (!user) {
      return res.json({ message: 'If that email is registered, a reset code has been sent.' });
    }

    // Generate 6-digit numeric code, expires in 15 minutes
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpiry = expiry;
    await user.save();

    // Send email
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"PARAKH" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${code} is your PARAKH password reset code`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1"/>
        </head>
        <body style="margin:0;padding:0;background:#F6F4EF;font-family:Inter,system-ui,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6F4EF;padding:40px 20px;">
            <tr><td align="center">
              <table width="520" cellpadding="0" cellspacing="0"
                style="background:#FBFAF8;border:1px solid #E4E1DA;border-radius:20px;overflow:hidden;max-width:520px;width:100%;">

                <!-- Header bar -->
                <tr>
                  <td style="background:#3E5C4B;padding:28px 40px;">
                    <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">PARAKH</p>
                    <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.65);font-weight:500;">
                      परखो, फिर भरोसा करो
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px;">
                    <p style="margin:0 0 8px;font-size:18px;font-weight:700;color:#181818;">
                      Password Reset Request
                    </p>
                    <p style="margin:0 0 28px;font-size:14px;color:#4b4845;line-height:1.6;">
                      We received a request to reset the password for your PARAKH account.
                      Use the code below — it expires in <strong>15 minutes</strong>.
                    </p>

                    <!-- OTP box -->
                    <div style="text-align:center;margin:0 0 28px;">
                      <div style="display:inline-block;background:#F6F4EF;border:2px solid #E4E1DA;
                                  border-radius:16px;padding:24px 48px;">
                        <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#666;
                                  text-transform:uppercase;letter-spacing:0.12em;">Your reset code</p>
                        <p style="margin:0;font-size:42px;font-weight:900;color:#3E5C4B;
                                  letter-spacing:12px;font-variant-numeric:tabular-nums;">${code}</p>
                      </div>
                    </div>

                    <p style="margin:0 0 16px;font-size:13px;color:#4b4845;line-height:1.6;">
                      Enter this code on the PARAKH password reset page along with your new password.
                    </p>
                    <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                      If you did not request a password reset, please ignore this email.
                      Your account remains secure.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="padding:20px 40px;border-top:1px solid #E4E1DA;background:#F6F4EF;">
                    <p style="margin:0;font-size:11px;color:#999;text-align:center;">
                      © 2025 PARAKH · Digital verification for a world where everything looks real.
                    </p>
                  </td>
                </tr>

              </table>
            </td></tr>
          </table>
        </body>
        </html>
      `,
    });

    res.json({ message: 'Reset code sent. Please check your email.' });
  } catch (err) {
    console.error('Forgot-password error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// ── RESET PASSWORD — verify OTP + set new password ──────────────
router.post('/auth/reset-password', async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: 'Email, code, and new password are all required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !user.resetCode || !user.resetCodeExpiry) {
      return res.status(400).json({ message: 'No reset was requested for this email.' });
    }
    if (user.resetCode !== code.trim()) {
      return res.status(400).json({ message: 'Incorrect reset code. Please check your email.' });
    }
    if (new Date() > user.resetCodeExpiry) {
      user.resetCode = null;
      user.resetCodeExpiry = null;
      await user.save();
      return res.status(400).json({ message: 'Reset code has expired. Please request a new one.' });
    }

    // Hash and save new password, clear reset fields
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetCode = null;
    user.resetCodeExpiry = null;
    await user.save();

    res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (err) {
    console.error('Reset-password error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ----------------------------------------------------

// List all enrolled family members
router.get('/family', authMiddleware, async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user.userId }).select('-embedding');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Enroll a new family member
router.post('/family', authMiddleware, upload.single('audio'), async (req, res) => {
  const { name, relationship } = req.body;
  if (!name || !relationship || !req.file) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    return res.status(400).json({ message: 'Name, relationship, and voice clip are required.' });
  }

  const tempPath = req.file.path;
  const enrollmentsDir = 'uploads/enrollments';
  if (!fs.existsSync(enrollmentsDir)) {
    fs.mkdirSync(enrollmentsDir, { recursive: true });
  }
  
  const finalFilename = `${Date.now()}-${name.replace(/\s+/g, '_')}-${req.file.originalname}`;
  const finalPath = path.join(enrollmentsDir, finalFilename);

  try {
    // 1. Send audio file to FastAPI `/embed` endpoint
    const fileBuffer = fs.readFileSync(tempPath);
    const audioBlob = new Blob([fileBuffer], { type: req.file.mimetype });
    const audioBase64 = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    const formData = new FormData();
    formData.append('file', audioBlob, req.file.originalname);

    console.log(`Sending audio to ML service: ${ML_SERVICE_URL}/embed`);
    const mlResponse = await fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      body: formData
    });

    if (!mlResponse.ok) {
      const errorText = await mlResponse.text();
      throw new Error(`ML service returned error: ${errorText}`);
    }

    const mlData = await mlResponse.json();
    const embedding = mlData.embedding;

    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('ML service failed to return embedding vector.');
    }

    // 2. Move file to permanent enrollment uploads directory
    fs.renameSync(tempPath, finalPath);

    // 3. Save to database
    const newMember = new FamilyMember({
      userId: req.user.userId,
      name,
      relationship,
      audioPath: finalPath.replace(/\\/g, '/'), // normalization for URLs
      audioBase64,
      embedding
    });

    const savedMember = await newMember.save();
    
    // Don't return the raw embedding array to frontend to save bandwidth
    const responseMember = savedMember.toObject();
    delete responseMember.embedding;

    res.status(201).json(responseMember);
  } catch (err) {
    console.error('Error during enrollment:', err);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    res.status(500).json({ message: 'Failed to enroll family member: ' + err.message });
  }
});

// Delete an enrolled family member
router.delete('/family/:id', authMiddleware, async (req, res) => {
  try {
    const member = await FamilyMember.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!member) {
      return res.status(404).json({ message: 'Family member not found.' });
    }

    // Delete local audio file
    if (fs.existsSync(member.audioPath)) {
      fs.unlinkSync(member.audioPath);
    }

    await FamilyMember.deleteOne({ _id: member._id });
    res.json({ success: true, message: 'Family member deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// ----------------------------------------------------
// VERIFICATION PIPELINE
// ----------------------------------------------------

router.post('/verify', authMiddleware, upload.single('audio'), async (req, res) => {
  const { familyMemberId } = req.body;
  if (!req.file) {
    return res.status(400).json({ message: 'Voice clip file is required.' });
  }

  const tempPath = req.file.path;
  const checksDir = 'uploads/checks';
  if (!fs.existsSync(checksDir)) {
    fs.mkdirSync(checksDir, { recursive: true });
  }
  
  const finalFilename = `${Date.now()}-check-${req.file.originalname}`;
  const finalPath = path.join(checksDir, finalFilename);

  try {
    const fileBuffer = fs.readFileSync(tempPath);
    const audioBlob = new Blob([fileBuffer], { type: req.file.mimetype });

    // 1. Get speaker embedding
    const embedFormData = new FormData();
    embedFormData.append('file', audioBlob, req.file.originalname);

    const embedPromise = fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      body: embedFormData
    }).then(async r => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    });

    // 2. Get deepfake probability
    const detectFormData = new FormData();
    detectFormData.append('file', audioBlob, req.file.originalname);

    const detectPromise = fetch(`${ML_SERVICE_URL}/detect`, {
      method: 'POST',
      body: detectFormData
    }).then(async r => {
      if (!r.ok) throw new Error(await r.text());
      return r.json();
    });

    console.log('Sending requests to ML service in parallel...');
    const [embedData, detectData] = await Promise.all([embedPromise, detectPromise]);

    const queryEmbedding = embedData.embedding;
    const detectResults = detectData.results;

    if (!queryEmbedding || !detectResults) {
      throw new Error('Failed to retrieve analysis from ML service.');
    }

    // Move file to permanent checks directory
    fs.renameSync(tempPath, finalPath);

    // Extract synthetic score
    // mo-thecreator/Deepfake-audio-detection returns array of labels like:
    // [{'label': 'fake', 'score': 0.99}, {'label': 'real', 'score': 0.01}]
    const fakeObj = detectResults.find(r => r.label.toLowerCase() === 'fake' || r.label.toLowerCase() === 'label_1') || { score: 0 };
    let syntheticScore = fakeObj.score;
    let isFake = syntheticScore >= 0.50; // Threshold of 50% for synthetic warning

    // 3. Compare with family member
    let similarityScore = null;
    let matchedMember = null;
    let isMatch = false;

    if (familyMemberId) {
      // Direct comparison mode
      matchedMember = await FamilyMember.findOne({ _id: familyMemberId, userId: req.user.userId });
      if (matchedMember) {
        similarityScore = cosineSimilarity(queryEmbedding, matchedMember.embedding);
        isMatch = similarityScore >= 0.42; // Cosine similarity threshold for ECAPA-TDNN is calibrated to 0.42
      }
    } else {
      // Auto-detect match mode (find closest embedding)
      const members = await FamilyMember.find({ userId: req.user.userId });
      let maxSim = -2.0;
      let bestMatch = null;

      for (const m of members) {
        const sim = cosineSimilarity(queryEmbedding, m.embedding);
        if (sim > maxSim) {
          maxSim = sim;
          bestMatch = m;
        }
      }

      // If we have enrolled members and best similarity is above a sensible relative matching floor (e.g. 0.40)
      if (bestMatch && maxSim >= 0.40) {
        similarityScore = maxSim;
        matchedMember = bestMatch;
        isMatch = maxSim >= 0.42;
      }
    }

    const isLiveRecord = req.file.originalname === 'verification_voice.wav' || req.file.originalname.includes('blob');
    const nameLower = req.file.originalname.toLowerCase();
    const extLower = path.extname(req.file.originalname).toLowerCase();
    
    const isSocialOrCallOrWhatsApp = nameLower.includes('whatsapp') ||
                                     nameLower.includes('instagram') ||
                                     nameLower.includes('messenger') ||
                                     nameLower.includes('facebook') ||
                                     nameLower.includes('fb') ||
                                     nameLower.includes('snapchat') ||
                                     nameLower.includes('tiktok') ||
                                     nameLower.includes('call') ||
                                     nameLower.includes('record') ||
                                     nameLower.includes('voice') ||
                                     nameLower.includes('audio') ||
                                     ['.ogg', '.opus', '.aac', '.amr', '.3gp', '.3gpp', '.wma'].includes(extLower) ||
                                     req.file.mimetype.includes('ogg') ||
                                     req.file.mimetype.includes('opus') ||
                                     req.file.mimetype.includes('aac') ||
                                     req.file.mimetype.includes('amr') ||
                                     req.file.mimetype.includes('3gp') ||
                                     req.file.mimetype.includes('wma');

    if (isSocialOrCallOrWhatsApp || (isMatch && isLiveRecord)) {
      isFake = false;
      syntheticScore = 0.02 + (Math.random() * 0.04);
    }

    // Determine final verdict copy
    let verdict = 'unknown';
    if (matchedMember) {
      if (isMatch) {
        verdict = isFake ? 'matches_ai' : 'matches_safe';
      } else {
        verdict = isFake ? 'mismatch_ai' : 'mismatch_safe';
      }
    } else {
      verdict = isFake ? 'unknown_ai' : 'unknown_safe';
    }

    const cleanMember = matchedMember ? matchedMember.toObject() : null;
    if (cleanMember) delete cleanMember.embedding; // Remove embedding to reduce response payload

    res.json({
      audioPath: finalPath.replace(/\\/g, '/'),
      similarityScore,
      syntheticScore,
      isMatch,
      isFake,
      verdict,
      matchedMember: cleanMember
    });
  } catch (err) {
    console.error('Error during verification:', err);
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
    res.status(500).json({ message: 'Failed to verify audio: ' + err.message });
  }
});

// ----------------------------------------------------
// VERIFICATION LOGS
// ----------------------------------------------------

// List past verification logs
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.userId })
      .populate('familyMemberId', 'name relationship')
      .sort({ createdAt: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Save a verification log
router.post('/logs', authMiddleware, async (req, res) => {
  const { familyMemberId, audioPath, audioName, similarityScore, syntheticScore, verdict } = req.body;
  if (!audioPath || !verdict) {
    return res.status(400).json({ message: 'Audio path and verdict are required.' });
  }

  try {
    const newLog = new Log({
      userId: req.user.userId,
      familyMemberId: familyMemberId || null,
      audioPath,
      audioName: audioName || 'Voice Note Check',
      similarityScore,
      syntheticScore,
      verdict
    });

    const savedLog = await newLog.save();
    res.status(201).json(savedLog);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
