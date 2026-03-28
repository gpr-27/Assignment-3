const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a study assistant that analyzes notes. 
Return ONLY a valid JSON object (no markdown, no code fences) with these exact keys:
- "summary": a 2-3 paragraph summary of the notes
- "bullets": an array of 5-8 key takeaway strings
- "tags": an array of topic tag strings with # prefix (e.g. "#algorithms")
- "difficulty": exactly one of "Beginner", "Intermediate", or "Advanced"
- "mindMap": a nested object with "label" (string) and "children" (array of objects with same structure)

The mindMap should have 3-5 top-level children, each with 1-3 sub-children representing the hierarchical structure of the notes.`;

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
