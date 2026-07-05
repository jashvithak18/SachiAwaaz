const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const { authMiddleware } = require('../auth');

// Get settings
router.get('/', authMiddleware, async (req, res) => {
  try {
    let settings = await Setting.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Setting({ userId: req.user.userId });
      await settings.save();
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update settings
router.put('/', authMiddleware, async (req, res) => {
  const { mfaEnabled, emailNotifications, forensicThreshold } = req.body;
  try {
    let settings = await Setting.findOne({ userId: req.user.userId });
    if (!settings) {
      settings = new Setting({ userId: req.user.userId });
    }

    if (typeof mfaEnabled === 'boolean') settings.mfaEnabled = mfaEnabled;
    if (typeof emailNotifications === 'boolean') settings.emailNotifications = emailNotifications;
    if (typeof forensicThreshold === 'number') settings.forensicThreshold = forensicThreshold;

    const savedSettings = await settings.save();
    res.json(savedSettings);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
