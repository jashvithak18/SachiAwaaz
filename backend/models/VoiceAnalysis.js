const mongoose = require('mongoose');

const VoiceAnalysisSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  similarityScore: {
    type: Number,
    required: false
  },
  syntheticScore: {
    type: Number,
    required: true
  },
  isMatch: {
    type: Boolean,
    default: false
  },
  isFake: {
    type: Boolean,
    default: false
  },
  matchedMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: false
  }
});

module.exports = mongoose.model('VoiceAnalysis', VoiceAnalysisSchema);
