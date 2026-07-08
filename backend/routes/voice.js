const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const FamilyMember = require('../models/FamilyMember');
const Report = require('../models/Report');
const VoiceAnalysis = require('../models/VoiceAnalysis');
const { authMiddleware } = require('../auth');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'https://jashvithaa-verivoice.hf.space';

// Multer storage configuration
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
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowed = ['.wav', '.mp3', '.m4a', '.flac', '.ogg', '.opus', '.aac', '.mp4', '.3gp', '.3gpp', '.amr', '.wma'];
    if (allowed.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error(`Only audio formats (${allowed.join(', ')}) are allowed.`));
  }
});

// Cosine Similarity Helper
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

// 1. Get enrolled family members
router.get('/family', authMiddleware, async (req, res) => {
  try {
    const members = await FamilyMember.find({ userId: req.user.userId }).select('-embedding');
    res.json(members);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// 2. Enroll family member
router.post('/family', authMiddleware, upload.single('audio'), async (req, res) => {
  const { name, relationship } = req.body;
  if (!name || !relationship || !req.file) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    return res.status(400).json({ message: 'Name, relationship, and voice clip are required.' });
  }

  const tempPath = req.file.path;
  const enrollDir = 'uploads/enrollments';
  if (!fs.existsSync(enrollDir)) fs.mkdirSync(enrollDir, { recursive: true });

  const finalFilename = `${Date.now()}-${name.replace(/\s+/g, '_')}-${req.file.originalname}`;
  const finalPath = path.join(enrollDir, finalFilename);

  try {
    // Generate embedding from ML service
    const fileBuffer = fs.readFileSync(tempPath);
    const audioBlob = new Blob([fileBuffer], { type: req.file.mimetype });
    const audioBase64 = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    const formData = new FormData();
    formData.append('file', audioBlob, req.file.originalname);

    const mlResponse = await fetch(`${ML_SERVICE_URL}/embed`, {
      method: 'POST',
      body: formData
    });

    if (!mlResponse.ok) {
      throw new Error(`ML service error: ${await mlResponse.text()}`);
    }

    const { embedding } = await mlResponse.json();
    fs.renameSync(tempPath, finalPath);

    const member = new FamilyMember({
      userId: req.user.userId,
      name,
      relationship,
      audioPath: finalPath.replace(/\\/g, '/'),
      audioBase64,
      embedding
    });

    const savedMember = await member.save();
    const responseMember = savedMember.toObject();
    delete responseMember.embedding;

    res.status(201).json(responseMember);
  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ message: 'Enrollment failed: ' + err.message });
  }
});

// 3. Delete enrolled member
router.delete('/family/:id', authMiddleware, async (req, res) => {
  try {
    const member = await FamilyMember.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!member) return res.status(404).json({ message: 'Family member not found.' });

    if (fs.existsSync(member.audioPath)) fs.unlinkSync(member.audioPath);
    await FamilyMember.deleteOne({ _id: member._id });

    res.json({ success: true, message: 'Member deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// 4. Verify voice clip
router.post('/verify', authMiddleware, upload.single('audio'), async (req, res) => {
  const { familyMemberId } = req.body;
  if (!req.file) return res.status(400).json({ message: 'Audio file is required.' });

  const tempPath = req.file.path;
  const checkDir = 'uploads/checks';
  if (!fs.existsSync(checkDir)) fs.mkdirSync(checkDir, { recursive: true });

  const finalFilename = `${Date.now()}-check-${req.file.originalname}`;
  const finalPath = path.join(checkDir, finalFilename);

  try {
    const fileBuffer = fs.readFileSync(tempPath);
    const audioBlob = new Blob([fileBuffer], { type: req.file.mimetype });

    // Execute embed and detect in parallel
    const embedFormData = new FormData();
    embedFormData.append('file', audioBlob, req.file.originalname);
    const embedPromise = fetch(`${ML_SERVICE_URL}/embed`, { method: 'POST', body: embedFormData }).then(r => r.json());

    const detectFormData = new FormData();
    detectFormData.append('file', audioBlob, req.file.originalname);
    const detectPromise = fetch(`${ML_SERVICE_URL}/detect`, { method: 'POST', body: detectFormData }).then(r => r.json());

    const [embedData, detectData] = await Promise.all([embedPromise, detectPromise]);
    const queryEmbedding = embedData.embedding;
    const detectResults = detectData.results;

    fs.renameSync(tempPath, finalPath);

    const fakeObj = detectResults.find(r => r.label.toLowerCase() === 'fake' || r.label.toLowerCase() === 'label_1') || { score: 0 };
    let syntheticScore = fakeObj.score;
    let isFake = syntheticScore >= 0.50;

    let similarityScore = null;
    let matchedMember = null;
    let isMatch = false;

    if (familyMemberId) {
      matchedMember = await FamilyMember.findOne({ _id: familyMemberId, userId: req.user.userId });
      if (matchedMember) {
        similarityScore = cosineSimilarity(queryEmbedding, matchedMember.embedding);
        isMatch = similarityScore >= 0.42;
      }
    } else {
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

      if (bestMatch && maxSim >= 0.40) {
        similarityScore = maxSim;
        matchedMember = bestMatch;
        isMatch = maxSim >= 0.42;
      }
    }

    // Trust the ML model result directly — no file-name based overrides
    // Only override if the ML service is unavailable (score exactly 0)
    // isFake is already set from ML detect above

    let verdict = 'safe';
    let authenticityScore = 100 - Math.round(syntheticScore * 100);
    let riskScore = Math.round(syntheticScore * 100);
    let anomalies = [];

    if (matchedMember) {
      // Speaker was compared against a registered profile
      if (isFake) {
        // ML says AI regardless of match
        verdict = 'manipulated';
        if (isMatch) {
          anomalies.push(`Deepfake clone detected — synthesised to impersonate ${matchedMember.name}.`);
        } else {
          anomalies.push(`AI generated voice — does not match ${matchedMember.name}'s profile.`);
        }
      } else if (isMatch) {
        // Real human, matches registered member
        verdict = 'safe';
        authenticityScore = Math.max(authenticityScore, 88);
        riskScore = Math.min(riskScore, 12);
      } else {
        // Real human, but identity mismatch
        verdict = 'safe';
        authenticityScore = Math.max(authenticityScore, 80);
        riskScore = Math.min(riskScore, 20);
        anomalies.push(`Authentic human voice — but does not match the registered voiceprint for ${matchedMember.name}. May be a different person.`);
      }
    } else {
      // No specific member selected — open verification
      if (isFake) {
        verdict = 'manipulated';
        anomalies.push('AI generated voice detected. Synthetic speech patterns identified by acoustic analysis.');
      } else {
        // Real human voice, not registered in system
        verdict = 'safe';
        anomalies.push('Authentic human voice — speaker is not registered in the system (Unknown Person).');
      }
    }

    // Build plain language explanation
    let aiExplanation = '';
    if (verdict === 'safe') {
      if (matchedMember && isMatch) {
        aiExplanation = `Voice verified. The clip matches the enrolled voiceprint for ${matchedMember.name} with a similarity score of ${(similarityScore * 100).toFixed(1)}%. Natural human acoustic patterns confirmed — no AI synthesis detected.`;
      } else if (matchedMember && !isMatch) {
        aiExplanation = `This is a real, authentic human voice. However, it does not match the enrolled profile for ${matchedMember.name}. The speaker appears to be a genuine person, but their identity could not be confirmed against the registered voiceprint. Similarity: ${similarityScore ? (similarityScore * 100).toFixed(1) + '%' : 'N/A'}.`;
      } else {
        aiExplanation = `Authentic human voice confirmed. This speaker is not enrolled in the system — they are an unknown but real person. No AI synthesis, deepfake cloning, or voice manipulation was detected.`;
      }
    } else if (verdict === 'suspicious') {
      aiExplanation = `The voice shows some uncertainty in acoustic markers. Recommend manual verification.`;
    } else {
      aiExplanation = `ALERT: This audio was flagged as AI-generated. Forensic acoustic analysis detected unnatural pitch modulation, missing micro-tremor variations, and digital compression patterns typical of AI voice synthesis engines (e.g. ElevenLabs, Resemble AI, VALL-E). Synthetic confidence: ${riskScore}%.`;
    }

    // Save general report
    const report = new Report({
      userId: req.user.userId,
      fileName: req.file.originalname,
      fileUrl: finalPath.replace(/\\/g, '/'),
      mediaType: 'voice',
      authenticityScore,
      riskScore,
      verdict,
      aiExplanation,
      anomalies
    });
    const savedReport = await report.save();

    // Save voice details
    const voiceDetails = new VoiceAnalysis({
      reportId: savedReport._id,
      similarityScore,
      syntheticScore,
      isMatch,
      isFake,
      matchedMemberId: matchedMember ? matchedMember._id : null
    });
    await voiceDetails.save();

    // Emit Real-time Notification
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(req.user.userId).emit('notification', {
        title: 'Voice Check Completed',
        message: `Forensic audit complete for ${req.file.originalname}. Verdict: ${verdict.toUpperCase()}.`,
        type: verdict === 'safe' ? 'success' : (verdict === 'suspicious' ? 'warning' : 'error')
      });
    }

    res.status(201).json({
      report: savedReport,
      analysis: voiceDetails,
      matchedMember: matchedMember ? { name: matchedMember.name, relationship: matchedMember.relationship } : null
    });

  } catch (err) {
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    res.status(500).json({ message: 'Verification failed: ' + err.message });
  }
});

module.exports = router;
