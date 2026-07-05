const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mediaType: {
    type: String,
    enum: ['voice', 'image', 'document'],
    required: true
  },
  authenticityScore: {
    type: Number,
    required: true // 0 to 100
  },
  riskScore: {
    type: Number,
    required: true // 0 to 100
  },
  verdict: {
    type: String,
    enum: ['safe', 'suspicious', 'manipulated'],
    required: true
  },
  aiExplanation: {
    type: String,
    required: true
  },
  anomalies: {
    type: [String],
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Report', ReportSchema);
