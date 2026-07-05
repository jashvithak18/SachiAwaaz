const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Report = require('../models/Report');
const Setting = require('../models/Setting');
const { authMiddleware } = require('../auth');

// Admin Authorization Middleware
const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Administrator privileges required.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};

// 1. Get platform stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReports = await Report.countDocuments();
    
    const voiceCount = await Report.countDocuments({ mediaType: 'voice' });
    const imageCount = await Report.countDocuments({ mediaType: 'image' });
    const docCount = await Report.countDocuments({ mediaType: 'document' });

    // Calculate Average Trust Score
    const reportsList = await Report.find();
    let sumTrust = 0;
    reportsList.forEach(r => {
      sumTrust += r.authenticityScore;
    });
    const avgTrustScore = totalReports > 0 ? Math.round(sumTrust / totalReports) : 100;

    res.json({
      totalUsers,
      totalReports,
      avgTrustScore,
      mediaDistribution: {
        voice: voiceCount,
        image: imageCount,
        document: docCount
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// 2. Get all users list
router.get('/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// 3. Delete a user
router.delete('/users/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });
    if (targetUser.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users.' });
    }

    await User.deleteOne({ _id: targetUser._id });
    await Setting.deleteOne({ userId: targetUser._id });
    // Keep reports but anonymize or delete them based on business rules. We'll delete them here.
    await Report.deleteMany({ userId: targetUser._id });

    res.json({ success: true, message: 'User and all associated data deleted.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// 4. View all reports (system wide audit)
router.get('/reports', authMiddleware, adminOnly, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('userId', 'email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
