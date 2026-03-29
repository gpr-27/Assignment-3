const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/authMiddleware');
const {
  analyzeNote,
  getAllNotes,
  getNoteById,
  deleteNote,
  toggleFavorite,
  generateNoteQuiz,
  getChatHistory,
  chatWithNote,
} = require('../controllers/noteController');

const ALLOWED_MIMES = [
  'application/pdf',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm',
];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB for audio files
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and audio files (mp3, wav, m4a, webm) are allowed'), false);
    }
  },
});

// Note CRUD
router.post('/analyze', auth, upload.single('file'), analyzeNote);
router.get('/', auth, getAllNotes);
router.get('/:id', auth, getNoteById);
router.delete('/:id', auth, deleteNote);
router.patch('/:id/favorite', auth, toggleFavorite);

// Quiz & Flashcards
router.post('/:id/quiz', auth, generateNoteQuiz);

// Chat with Notes
router.get('/:id/chat', auth, getChatHistory);
router.post('/:id/chat', auth, chatWithNote);

module.exports = router;
