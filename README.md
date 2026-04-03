# 📚 NoteWise — AI-Powered Study Notes Analyzer

A full-stack MERN application that lets you paste or upload PDF notes and get AI-generated summaries, bullet points, flashcards, quizzes, mind maps, and more — powered by Groq's `llama-3.3-70b-versatile`.

<div align="center">
  <h3>🟢 <strong>Live Demo:</strong> <a href="https://assignment-3-33j5.onrender.com/login">https://assignment-3-33j5.onrender.com/login</a></h3>
</div>

---

## ✨ Features

- 📄 **Paste text or upload PDF notes** to analyze your study material.
- 🤖 **AI-generated insights** including summaries, bullet points, topic tags & difficulty ratings.
- 🧠 **Interactive mind map visualization** for better conceptual understanding.
- 🃏 **Flashcards & Quiz generation** to test your knowledge interactively.
- 💬 **Chat with your notes** in a RAG-style conversational interface.
- 🔐 **User authentication** (Register / Login with secure JWT).
- ⭐ **Save, search, and favorite** your processed notes for later access.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, TailwindCSS v4, `@xyflow/react`, `framer-motion` |
| Backend | Node.js, Express, JWT, bcryptjs, multer, pdf-parse |
| Database | MongoDB (Atlas or local instance) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| DevOps | Docker, Docker Compose, Kubernetes (Minikube) |

---

## 🗂️ Project Structure

```text
Assignment-3/
├── client/              # React + Vite frontend (TailwindCSS, @xyflow/react)
│   ├── src/             # Source code (components, pages, context, utils)
│   └── package.json     # Frontend dependencies
├── server/              # Node.js + Express backend
│   ├── controllers/     # authController, noteController
│   ├── middleware/      # authMiddleware (JWT)
│   ├── models/          # Mongoose models (User, Note, etc.)
│   ├── routes/          # API Routes (auth, notes)
│   └── services/        # groqService (AI integrations)
├── k8s/                 # Kubernetes deployment manifests
├── Dockerfile           # Multi-stage Docker build for the app
├── docker-compose.yml   # Docker Compose for local full-stack run
├── SUBMISSION.md        # University submission details and proof of execution
└── README.md            # You are here
```

---

## 🚀 Running Locally

There are three ways to run this project on your local machine: **Native (npm), Docker Compose, or Kubernetes.**

### Prerequisites

- [Node.js v18+](https://nodejs.org/) (for Native method)
- [Docker & Docker Compose](https://www.docker.com/) (for Docker methods)
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) & `kubectl` (for Kubernetes)
- [Groq API Key](https://console.groq.com)
- MongoDB Atlas Account or Local MongoDB

---

### ⚙️ Option 1: Native (Node.js & npm)

**1. Backend**
```bash
cd server
npm install
```
Create a `server/.env` file:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/notewise
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your_jwt_secret_key
```
Start the server:
```bash
npm start
# Server runs at http://localhost:5000
```

**2. Frontend**
```bash
cd ../client
npm install
npm run dev
# App runs at http://localhost:5173
```
*Note: The Vite dev server proxies API requests to the backend.*

---

### 🐳 Option 2: Docker Compose (Recommended)

Quickest way to spin up both the database and the app inside containers.

1. Ensure Docker daemon is running.
2. From the repository root, run:

```bash
docker compose up --build
```

3. The application will be accessible at: `http://localhost:5000`.

*(If you ever need to run the Docker container standalone without Compose, you can build it with `docker build -t notewise:latest .` and pass the required environment variables during `docker run`.)*

---

### ☸️ Option 3: Kubernetes (Minikube)

You can orchestrate the application using the predefined Kubernetes manifests located in the `k8s/` directory.

1. **Start Minikube & Configure Docker:**
   ```bash
   minikube start
   eval $(minikube docker-env)
   ```

2. **Build the Application Image inside Minikube:**
   ```bash
   docker build -t notewise:latest .
   ```

3. **Configure Secrets:**
   Create a secret for your API keys using `kubectl`:
   ```bash
   kubectl create secret generic notewise-secrets \
     --from-literal=GROQ_API_KEY="your_groq_api_key_here" \
     --from-literal=JWT_SECRET="your_jwt_secret_here"
   ```

4. **Deploy Database & Application:**
   ```bash
   kubectl apply -f k8s/mongo.yaml
   kubectl apply -f k8s/app.yaml
   ```

5. **Verify & Access:**
   Check if pods are running:
   ```bash
   kubectl get pods
   ```
   Access the app via Minikube's service URL (NodePort):
   ```bash
   minikube service notewise
   ```

---

## 🔐 Environment Variables Reference

| Variable | Description | Location | Default / Example |
|----------|-------------|----------|-------------------|
| `PORT` | Server port | `.env` / Docker | `5000` |
| `MONGO_URI` | MongoDB Connection URL | `.env` / Docker | `mongodb://mongo:27017/notewise` |
| `GROQ_API_KEY` | Groq API key | `.env` / K8s Secret | *Required* |
| `JWT_SECRET` | JWT signing secret | `.env` / K8s Secret | *Required* |

*⚠️ **Note:** The `.env` file must be excluded from version control (via `.gitignore`). Never commit real API keys or JWT secrets publicly.*
