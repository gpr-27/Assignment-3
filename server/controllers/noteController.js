const Note = require('../models/Note');
const { PDFParse } = require('pdf-parse');
const { analyzeNotes } = require('../services/groqService');

exports.analyzeNote = async (req, res) => {
  try {
    let text = req.body.text || '';
    const title = req.body.title || 'Untitled Note';

    if (req.file) {
      const parser = new PDFParse({ data: req.file.buffer });
      try {
        const pdfResult = await parser.getText();
        text = pdfResult.text || '';
      } finally {
        await parser.destroy();
      }
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'No text provided. Paste notes or upload a PDF.' });
    }

    const analysis = await analyzeNotes(text);

    const note = await Note.create({
      userId: req.userId,
      title,
      rawText: text,
      summary: analysis.summary,
      bullets: analysis.bullets,
      tags: analysis.tags,
      difficulty: analysis.difficulty,
      mindMap: analysis.mindMap,
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.toggleFavorite = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    note.isFavorite = !note.isFavorite;
    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
