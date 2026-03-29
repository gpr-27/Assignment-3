const Note = require("../models/Note");
const Conversation = require("../models/Conversation");
const { PDFParse } = require("pdf-parse");
const {
  analyzeNotes,
  generateQuiz,
  chatWithNotes,
  transcribeAudio,
} = require("../services/groqService");

const AUDIO_MIMES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/webm",
];

// ─── Analyze Note ────────────────────────────────────────────────────
// Now auto-generates quiz + flashcards alongside summary/bullets/etc.

exports.analyzeNote = async (req, res) => {
  try {
    let text = req.body.text || "";
    const title = req.body.title || "Untitled Note";

    if (req.file) {
      const mime = req.file.mimetype;

      if (mime === "application/pdf") {
        const parser = new PDFParse({ data: req.file.buffer });
        try {
          const pdfResult = await parser.getText();
          text = pdfResult.text || "";
        } finally {
          await parser.destroy();
        }
      } else if (AUDIO_MIMES.includes(mime)) {
        const transcript = await transcribeAudio(
          req.file.buffer,
          req.file.originalname,
        );
        text = transcript;
      }
    }

    if (!text.trim()) {
      return res
        .status(400)
        .json({
          error:
            "No text provided. Paste notes, upload a PDF, or upload an audio file.",
        });
    }

    // Single API call now returns everything including quiz + flashcards
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
      quiz: analysis.quiz || [],
      flashcards: analysis.flashcards || [],
    });

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get All Notes ───────────────────────────────────────────────────
// Excludes soft-deleted notes

exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({
      userId: req.userId,
      isDeleted: { $ne: true },
    }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Note By ID ──────────────────────────────────────────────────

exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json(note);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Soft Delete Note ────────────────────────────────────────────────
// Sets isDeleted flag — does NOT remove from database.
// Chat conversations are also preserved.

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { isDeleted: true } },
      { new: true },
    );
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    res.json({ message: "Note archived" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Toggle Favorite ─────────────────────────────────────────────────

exports.toggleFavorite = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }
    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { isFavorite: !note.isFavorite } },
      { new: true },
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Regenerate Quiz ─────────────────────────────────────────────────
// Generates a fresh set of questions + flashcards for an existing note.
// Uses atomic $set to avoid Mongoose __v version conflicts.

exports.generateNoteQuiz = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const quizData = await generateQuiz(note.rawText);

    const newQuiz = quizData.questions || [];
    const newFlashcards = quizData.flashcards || [];

    const updated = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { quiz: newQuiz, flashcards: newFlashcards } },
      { new: true },
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Get Chat History ────────────────────────────────────────────────
// Returns messages for a specific note + specific user.
// All messages are stored inside a single Conversation document per user per note.

exports.getChatHistory = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const convo = await Conversation.findOne({
      noteId: req.params.id,
      userId: req.userId,
    });

    // Return empty array if no conversation yet, or the messages array
    res.json(convo ? convo.messages : []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Chat with Note ──────────────────────────────────────────────────
// Sends user message, gets AI response, saves both into the single
// Conversation document for this user + note.
// Chat is isolated: each note × each user = one Conversation document.

exports.chatWithNote = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required" });
    }

    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    // Find or create the conversation document for this user + note
    let convo = await Conversation.findOne({
      noteId: req.params.id,
      userId: req.userId,
    });

    if (!convo) {
      convo = await Conversation.create({
        noteId: req.params.id,
        userId: req.userId,
        messages: [],
      });
    }

    // Build user message object
    const userMsg = {
      role: "user",
      content: message.trim(),
      createdAt: new Date(),
    };

    // Push user message into conversation
    convo.messages.push(userMsg);
    await convo.save();

    // Get the saved user message with its generated _id
    const savedUserMsg = convo.messages[convo.messages.length - 1];

    // Build chat history for Groq (last 20 messages for context window)
    const recentMessages = convo.messages.slice(-20);
    const chatHistory = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await chatWithNotes(note.rawText, chatHistory);

    // Push assistant message into conversation
    const assistantMsg = {
      role: "assistant",
      content: aiResponse,
      createdAt: new Date(),
    };
    convo.messages.push(assistantMsg);
    await convo.save();

    const savedAssistantMsg = convo.messages[convo.messages.length - 1];

    res.json({
      userMessage: savedUserMsg,
      assistantMessage: savedAssistantMsg,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
