const express = require('express');
const router = express.Router();
const fs = require('fs');
const Report = require('../models/Report');
const VoiceAnalysis = require('../models/VoiceAnalysis');
const ImageAnalysis = require('../models/ImageAnalysis');
const DocumentAnalysis = require('../models/DocumentAnalysis');
const { authMiddleware } = require('../auth');

// Get all reports for user with filters & search
router.get('/', authMiddleware, async (req, res) => {
  const { mediaType, verdict, search } = req.query;
  
  const query = { userId: req.user.userId };
  
  if (mediaType) {
    query.mediaType = mediaType;
  }
  if (verdict) {
    query.verdict = verdict;
  }
  if (search) {
    query.fileName = { $regex: search, $options: 'i' };
  }

  try {
    const reports = await Report.find(query).sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get single report with detailed module analysis
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    let analysisDetails = null;

    if (report.mediaType === 'voice') {
      analysisDetails = await VoiceAnalysis.findOne({ reportId: report._id }).populate('matchedMemberId', 'name relationship');
    } else if (report.mediaType === 'image') {
      analysisDetails = await ImageAnalysis.findOne({ reportId: report._id });
    } else if (report.mediaType === 'document') {
      analysisDetails = await DocumentAnalysis.findOne({ reportId: report._id });
    }

    res.json({
      report,
      details: analysisDetails
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Delete a report
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!report) return res.status(404).json({ message: 'Report not found.' });

    // Delete static file if it exists
    if (fs.existsSync(report.fileUrl)) {
      fs.unlinkSync(report.fileUrl);
    }

    // Delete detailed records
    if (report.mediaType === 'voice') {
      await VoiceAnalysis.deleteOne({ reportId: report._id });
    } else if (report.mediaType === 'image') {
      await ImageAnalysis.deleteOne({ reportId: report._id });
    } else if (report.mediaType === 'document') {
      await DocumentAnalysis.deleteOne({ reportId: report._id });
    }

    // Delete base report
    await Report.deleteOne({ _id: report._id });

    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
