# NoteWise

AI-Powered Study Notes Analyzer built with the MERN stack and Groq API.

## Features

- Paste or upload PDF notes
- AI-generated summaries, key bullet points, topic tags, and difficulty ratings
- Interactive mind map visualization
- User authentication (register/login)
- Save, search, and favorite notes

## Tech Stack

- **Frontend**: React (Vite), TailwindCSS, react-flow
- **Backend**: Node.js, Express, JWT, bcryptjs
- **Database**: MongoDB (Atlas)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Containerization**: Docker, docker-compose
- **Orchestration**: Kubernetes (Minikube)

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Groq API key

### Backend Setup

```bash
cd server
npm install
# Create .env with MONGO_URI, GROQ_API_KEY, JWT_SECRET, PORT
npm start
```

### Frontend Setup

```bash
cd client
npm install
npm run dev
```
