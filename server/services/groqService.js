const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const os = require('os');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── Master Analysis Prompt ─────────────────────────────────────────
// Single comprehensive prompt: generates summary, bullets, tags,
// difficulty, mindMap, quiz, AND flashcards in one shot.

const ANALYSIS_PROMPT = `You are NoteWise AI — an expert academic study coach who transforms raw notes into structured study materials.

Analyze the provided notes thoroughly and return ONLY a valid JSON object (no markdown, no code fences) with ALL of these keys:

{
  "summary": "A well-structured 2-3 paragraph analysis. First paragraph: what the topic IS and why it matters. Second paragraph: core concepts and how they connect. Third (optional): applications or implications. Write as if explaining to a smart peer who missed the lecture.",

  "bullets": [
    "5-8 highly specific takeaways. Each must be a standalone insight — not generic filler. Focus on exam-worthy concepts, surprising facts, and critical distinctions. Start with action verbs or specific nouns."
  ],

  "tags": [
    "4-8 tags with # prefix. Mix broad categories (#data-structures, #biology) with specific concepts (#red-black-trees, #mitosis). Use kebab-case."
  ],

  "difficulty": "Exactly one of: Beginner, Intermediate, Advanced. Judge by prerequisite-knowledge depth, not text length.",

  "mindMap": {
    "label": "Central Topic (2-4 words)",
    "children": [
      {
        "label": "Key Branch (2-4 words)",
        "children": [
          { "label": "Specific Detail (2-5 words)" }
        ]
      }
    ]
  },

  "quiz": [
    {
      "question": "Thought-provoking question testing understanding, not just recall. Mix conceptual, application, and comparison questions.",
      "options": ["Correct answer", "Plausible wrong (common misconception)", "Plausible wrong (related concept)", "Clearly wrong but tempting"],
      "correctIndex": 0
    }
  ],

  "flashcards": [
    {
      "front": "Concise recall trigger — a specific question or 'Define X' or 'What is the difference between X and Y?'",
      "back": "Clear, memorable answer in 1-2 sentences maximum. Include a concrete example if possible."
    }
  ]
}

QUALITY STANDARDS:
- Summary: Connect ideas — show WHY, not just WHAT. No bullet-list disguised as paragraphs.
- Bullets: Each teaches something specific. Ban generic phrases like "This topic is important" or "There are many types."
- Quiz: Generate 5-8 questions. At least 2 application-based, 2 conceptual, 1 comparison. Shuffle correctIndex across questions.
- Flashcards: Generate 5-8 cards. Front must trigger active recall. Back must be concise and precise.
- MindMap: 3-5 top children, each with 1-3 sub-children. Labels must be concise (2-5 words max).
- Tags: Be specific — "#quicksort" beats "#sorting", "#photosynthesis" beats "#biology".`;

// ─── Quiz Regeneration Prompt ───────────────────────────────────────
// Used when user wants fresh questions for an existing note.

const QUIZ_REGEN_PROMPT = `You are NoteWise AI — an expert quiz creator. Generate DIFFERENT questions from the previous set.

Return ONLY valid JSON (no markdown) with:
{
  "questions": [
    {
      "question": "Fresh question testing deep understanding. Vary formats: 'Which of the following...', 'What would happen if...', 'The main difference between X and Y is...'",
      "options": ["4 options — make distractors plausible. Use common student misconceptions as wrong answers."],
      "correctIndex": 0
    }
  ],
  "flashcards": [
    {
      "front": "New recall trigger — different angle from previous flashcards",
      "back": "Concise answer with example"
    }
  ]
}

Generate 5-8 quiz questions (mix difficulties) and 5-8 flashcards. Shuffle correctIndex.`;

// ─── Chat Prompt ────────────────────────────────────────────────────

const CHAT_SYSTEM_PROMPT = `You are NoteWise AI — a patient, knowledgeable study tutor helping a student understand their notes.

RULES:
1. Answer ONLY from the provided notes context. If the answer isn't in the notes, say: "I don't see this covered in your notes. You might want to look into it separately."
2. Be concise but thorough. Use examples from the notes when possible.
3. If the student seems confused, break down the concept step by step.
4. Use simple language — explain like a helpful teaching assistant, not a textbook.
5. When relevant, connect the question to other concepts mentioned in the notes.

THE STUDENT'S NOTES:
---
`;

// ─── Analysis Function ──────────────────────────────────────────────
// Generates ALL study materials in a single API call.

exports.analyzeNotes = async (text) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: ANALYSIS_PROMPT },
      {
        role: 'user',
        content: `Analyze these notes and generate complete study materials:\n\n${text}`,
      },
    ],
    temperature: 0.3,
    max_tokens: 6144,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
};

// ─── Quiz Regeneration ──────────────────────────────────────────────
// Generates fresh quiz + flashcards for an existing note.

exports.generateQuiz = async (text) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: QUIZ_REGEN_PROMPT },
      {
        role: 'user',
        content: `Create a fresh quiz and flashcards from these notes:\n\n${text}`,
      },
    ],
    temperature: 0.5,
    max_tokens: 4096,
    response_format: { type: 'json_object' },
  });

  const content = response.choices[0].message.content;
  return JSON.parse(content);
};

// ─── Chat with Notes ────────────────────────────────────────────────
// Answers questions using the note's content as context.

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

// ─── Audio Transcription ────────────────────────────────────────────
// Transcribes audio using Groq Whisper, returns plain text.

exports.transcribeAudio = async (fileBuffer, originalName) => {
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
    try {
      fs.unlinkSync(tmpPath);
    } catch (_) {
      // ignore cleanup errors
    }
  }
};
