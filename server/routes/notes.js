const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const {
  getAllNotes,
  getNoteById,
  deleteNote,
  toggleFavorite,
} = require('../controllers/noteController');

router.get('/', auth, getAllNotes);
router.get('/:id', auth, getNoteById);
router.delete('/:id', auth, deleteNote);
router.patch('/:id/favorite', auth, toggleFavorite);

module.exports = router;
