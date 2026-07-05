const mongoose = require('mongoose');

const ImageAnalysisSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  editingIndicators: {
    type: [String],
    default: []
  },
  compressionArtifactsScore: {
    type: Number,
    required: true // 0 to 100
  },
  aiGenerationScore: {
    type: Number,
    required: true // 0 to 100
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

module.exports = mongoose.model('ImageAnalysis', ImageAnalysisSchema);
