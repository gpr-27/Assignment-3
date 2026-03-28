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
} = require('../controllers/noteController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  },
});

router.post('/analyze', auth, upload.single('pdf'), analyzeNote);
router.get('/', auth, getAllNotes);
router.get('/:id', auth, getNoteById);
router.delete('/:id', auth, deleteNote);
router.patch('/:id/favorite', auth, toggleFavorite);

module.exports = router;
