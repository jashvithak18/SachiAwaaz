const mongoose = require('mongoose');

const DocumentAnalysisSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  ocrConsistency: {
    type: String,
    default: 'Consistent'
  },
  qrDetection: {
    type: [String],
    default: []
  },
  signaturePresence: {
    type: String,
    default: 'None Detected'
  },
  possibleManipulation: {
    type: String,
    default: 'None Detected'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

module.exports = mongoose.model('DocumentAnalysis', DocumentAnalysisSchema);
