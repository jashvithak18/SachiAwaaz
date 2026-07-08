const mongoose = require('mongoose');

const FamilyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  relationship: {
    type: String,
    required: true,
    trim: true
  },
  audioPath: {
    type: String,
    required: true
  },
  audioBase64: {
    type: String,
    required: false
  },
  embedding: {
    type: [Number], // 192-dimensional vector
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FamilyMember', FamilyMemberSchema);
