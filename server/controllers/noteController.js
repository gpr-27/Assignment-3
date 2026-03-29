const Note = require('../models/Note');
const ChatMessage = require('../models/ChatMessage');
const { PDFParse } = require('pdf-parse');
const { analyzeNotes, generateQuiz, chatWithNotes, transcribeAudio } = require('../services/groqService');

const AUDIO_MIMES = [
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/mp4',
  'audio/x-m4a',
  'audio/m4a',
  'audio/webm',
];

exports.analyzeNote = async (req, res) => {
  try {
    let text = req.body.text || '';
    const title = req.body.title || 'Untitled Note';

    if (req.file) {
      const mime = req.file.mimetype;

      if (mime === 'application/pdf') {
        // Handle PDF
        const parser = new PDFParse({ data: req.file.buffer });
        try {
          const pdfResult = await parser.getText();
          text = pdfResult.text || '';
        } finally {
          await parser.destroy();
        }
      } else if (AUDIO_MIMES.includes(mime)) {
        // Handle audio — transcribe first
        const transcript = await transcribeAudio(req.file.buffer, req.file.originalname);
        text = transcript;
      }
    }

    if (!text.trim()) {
      return res.status(400).json({ error: 'No text provided. Paste notes, upload a PDF, or upload an audio file.' });
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
    // Also delete chat messages for this note
    await ChatMessage.deleteMany({ noteId: req.params.id });
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

// ─── Quiz & Flashcards ───────────────────────────────────────────────

exports.generateNoteQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const quizData = await generateQuiz(note.rawText);

    note.quiz = quizData.questions || [];
    note.flashcards = quizData.flashcards || [];
    await note.save();

    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Chat with Notes ─────────────────────────────────────────────────

exports.getChatHistory = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    const messages = await ChatMessage.find({
      noteId: req.params.id,
      userId: req.userId,
    }).sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.chatWithNote = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Get existing chat history (last 20 messages for context window)
    const history = await ChatMessage.find({
      noteId: req.params.id,
      userId: req.userId,
    })
      .sort({ createdAt: 1 })
      .limit(20);

    // Add the new user message
    const userMsg = await ChatMessage.create({
      noteId: req.params.id,
      userId: req.userId,
      role: 'user',
      content: message.trim(),
    });

    // Build chat history for Groq
    const chatHistory = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() },
    ];

    // Get AI response
    const aiResponse = await chatWithNotes(note.rawText, chatHistory);

    // Save assistant message
    const assistantMsg = await ChatMessage.create({
      noteId: req.params.id,
      userId: req.userId,
      role: 'assistant',
      content: aiResponse,
    });

    res.json({ userMessage: userMsg, assistantMessage: assistantMsg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
