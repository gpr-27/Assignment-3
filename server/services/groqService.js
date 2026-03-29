const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a study assistant that analyzes notes. 
Return ONLY a valid JSON object (no markdown, no code fences) with these exact keys:
- "summary": a 2-3 paragraph summary of the notes
- "bullets": an array of 5-8 key takeaway strings
- "tags": an array of topic tag strings with # prefix (e.g. "#algorithms")
- "difficulty": exactly one of "Beginner", "Intermediate", or "Advanced"
- "mindMap": a nested object with "label" (string) and "children" (array of objects with same structure)

The mindMap should have 3-5 top-level children, each with 1-3 sub-children representing the hierarchical structure of the notes.`;

const QUIZ_PROMPT = `You are a study assistant that creates quizzes from notes.
Return ONLY a valid JSON object (no markdown, no code fences) with these exact keys:
- "questions": an array of 5-8 multiple choice question objects. Each object has:
  - "question": the question string
  - "options": an array of exactly 4 option strings
  - "correctIndex": the zero-based index of the correct option (0-3)
- "flashcards": an array of 5-8 flashcard objects. Each object has:
  - "front": the question or concept (short)
  - "back": the answer or explanation (concise)

Make questions that test real understanding, not just memorization. Vary difficulty.`;

const CHAT_SYSTEM_PROMPT = `You are a helpful study assistant. The user has uploaded study notes and wants to ask questions about them. Answer ONLY based on the provided notes context. If the answer is not in the notes, say so honestly. Be concise and helpful.

Here are the user's study notes:
---
`;

exports.analyzeNotes = async (text) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: `Analyze the following notes:\n\n${text}` },
    ],
    temperature: 0.3,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
};

exports.generateQuiz = async (text) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: QUIZ_PROMPT },
      { role: 'user', content: `Create a quiz and flashcards from these notes:\n\n${text}` },
    ],
    temperature: 0.4,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
};

exports.chatWithNotes = async (noteText, chatHistory) => {
  const messages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT + noteText + '\n---' },
    ...chatHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })),
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages,
    temperature: 0.4,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
};

exports.transcribeAudio = async (fileBuffer, originalName) => {
  // Write buffer to a temp file because Groq SDK expects a file stream
  const ext = path.extname(originalName) || '.mp3';
  const tmpPath = path.join(os.tmpdir(), `notewise-audio-${Date.now()}${ext}`);

  try {
    fs.writeFileSync(tmpPath, fileBuffer);

    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-large-v3',
      language: 'en',
      response_format: 'text',
    });

    return typeof transcription === 'string' ? transcription : transcription.text;
  } finally {
    // Clean up temp file
    try {
      fs.unlinkSync(tmpPath);
    } catch (_) {
      // ignore cleanup errors
    }
  }
};
