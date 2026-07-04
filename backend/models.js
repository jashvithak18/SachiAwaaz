const mongoose = require('mongoose');

// User Schema
const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Family Member Schema (holds voiceprint embedding)
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
  embedding: {
    type: [Number], // 192-dimensional vector
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Verification Log Schema
const LogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  familyMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyMember',
    required: false // Optional if no specific member was selected/matched
  },
  audioPath: {
    type: String,
    required: true
  },
  audioName: {
    type: String,
    default: 'Uploaded Clip'
  },
  similarityScore: {
    type: Number,
    required: false
  },
  syntheticScore: {
    type: Number,
    required: true // Deepfake probability
  },
  verdict: {
    type: String,
    required: true // e.g. "match", "mismatch", "suspicious", "safe"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);
const FamilyMember = mongoose.model('FamilyMember', FamilyMemberSchema);
const Log = mongoose.model('Log', LogSchema);

module.exports = {
  User,
  FamilyMember,
  Log
};
