const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    default: 'Untitled Note',
    trim: true,
  },
  rawText: {
    type: String,
    required: [true, 'Note text is required'],
  },
  summary: {
    type: String,
    default: '',
  },
  bullets: {
    type: [String],
    default: [],
  },
  tags: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  mindMap: {
    type: Object,
    default: {},
  },
  quiz: {
    type: [
      {
        question: String,
        options: [String],
        correctIndex: Number,
      },
    ],
    default: [],
  },
  flashcards: {
    type: [
      {
        front: String,
        back: String,
      },
    ],
    default: [],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Note', noteSchema);
