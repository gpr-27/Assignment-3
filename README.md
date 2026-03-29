# 📚 NoteWise — AI-Powered Study Notes Analyzer

A full-stack MERN application (Phase 1) that lets you paste or upload PDF notes and get AI-generated summaries, bullet points, flashcards, quizzes, mind maps, and more — powered by Groq's `llama-3.3-70b-versatile`.

---

## 🗂️ Project Structure

```
Assignment-3/
├── client/              # React + Vite frontend (TailwindCSS, @xyflow/react)
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Route-level pages
│   │   ├── context/     # AuthContext
│   │   └── utils/       # API helper, JWT decoder
│   └── ...
├── server/              # Node.js + Express backend
│   ├── controllers/     # authController, noteController
│   ├── middleware/      # authMiddleware (JWT)
│   ├── models/          # Mongoose models (User, Note, etc.)
│   ├── routes/          # auth, notes
│   ├── services/        # groqService (AI calls)
│   └── ...
└── README.md
```

---

## ✨ Features

- 📄 Paste text or upload PDF notes
- 🤖 AI-generated summaries, bullet points, topic tags & difficulty ratings
- 🧠 Interactive mind map visualization
- 🃏 Flashcards & Quiz generation
- 💬 Chat with your notes (RAG-style)
- 🔐 User authentication (Register / Login with JWT)
- ⭐ Save, search, and favorite notes

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS v4, @xyflow/react, framer-motion |
| Backend | Node.js, Express, JWT, bcryptjs, multer, pdf-parse |
| Database | MongoDB (Atlas or local instance) |
| AI | Groq API — `llama-3.3-70b-versatile` |

---

## 🚀 Running Locally

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key → https://console.groq.com

### 1. Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/notewise
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your_jwt_secret_key
```

```bash
npm start
# Server runs at http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
npm run dev
# App runs at http://localhost:5173
```

The Vite dev server proxies API requests to the backend (see `client/vite.config.js`).

---

## 🔐 Security Notes

- The `.env` file is **gitignored** — never commit real API keys or secrets.
- Use strong, unique values for `JWT_SECRET` in any shared or deployed environment.

---

## 📦 Environment Variables Reference

| Variable | Description | Default (dev) |
|----------|-------------|---------------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | set in `.env` |
| `GROQ_API_KEY` | Groq API key | set in `.env` |
| `JWT_SECRET` | JWT signing secret | set in `.env` |
