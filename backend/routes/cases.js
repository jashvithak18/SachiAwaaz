const express = require('express');
const router = express.Router();
const Case = require('../models/Case');
const { authMiddleware } = require('../auth');

// Create a new case
router.post('/', authMiddleware, async (req, res) => {
  const { title, description } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Case title is required.' });
  }

  try {
    const newCase = new Case({
      userId: req.user.userId,
      title,
      description
    });
    const savedCase = await newCase.save();
    res.status(201).json(savedCase);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get all cases for logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const cases = await Case.find({ userId: req.user.userId })
      .populate('reports')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Get single case detail
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const targetCase = await Case.findOne({ _id: req.params.id, userId: req.user.userId })
      .populate({
        path: 'reports',
        options: { sort: { createdAt: 1 } } // chronological timeline sorting
      });
    if (!targetCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }
    res.json(targetCase);
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Add report to case
router.post('/:id/add-report', authMiddleware, async (req, res) => {
  const { reportId } = req.body;
  if (!reportId) {
    return res.status(400).json({ message: 'Report ID is required.' });
  }

  try {
    const targetCase = await Case.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!targetCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    if (targetCase.reports.includes(reportId)) {
      return res.status(400).json({ message: 'Report is already linked to this case.' });
    }

    targetCase.reports.push(reportId);
    await targetCase.save();

    res.json({ success: true, message: 'Report successfully linked to case.', targetCase });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Update case status
router.put('/:id/status', authMiddleware, async (req, res) => {
  const { status } = req.body;
  if (!status || (status !== 'active' && status !== 'closed')) {
    return res.status(400).json({ message: 'Status must be either active or closed.' });
  }

  try {
    const targetCase = await Case.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!targetCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    targetCase.status = status;
    await targetCase.save();

    res.json({ success: true, message: 'Case status updated.', targetCase });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// Delete a case
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const targetCase = await Case.findOne({ _id: req.params.id, userId: req.user.userId });
    if (!targetCase) {
      return res.status(404).json({ message: 'Case not found.' });
    }

    await Case.deleteOne({ _id: targetCase._id });
    res.json({ success: true, message: 'Case deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

module.exports = router;
