# 📚 NoteWise — AI-Powered Study Notes Analyzer

A full-stack MERN application that lets you paste or upload PDF notes and get AI-generated summaries, bullet points, flashcards, quizzes, mind maps, and more — powered by Groq's `llama-3.3-70b-versatile`.

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
│   ├── Dockerfile
│   └── nginx.conf
├── server/              # Node.js + Express backend
│   ├── controllers/     # authController, noteController
│   ├── middleware/      # authMiddleware (JWT)
│   ├── models/          # Mongoose models (User, Note, etc.)
│   ├── routes/          # auth, notes
│   ├── services/        # groqService (AI calls)
│   └── Dockerfile
├── k8s/                 # Kubernetes manifests
│   ├── namespace.yaml
│   ├── secret.yaml
│   ├── mongo-deployment.yaml
│   ├── server-deployment.yaml
│   └── client-deployment.yaml
├── docker-compose.yml
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
| Database | MongoDB (Atlas or local via Docker) |
| AI | Groq API — `llama-3.3-70b-versatile` |
| Containerization | Docker, docker-compose |
| Orchestration | Kubernetes (Minikube) |

---

## 🚀 Running Locally (Without Docker)

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

---

## 🐳 Running with Docker

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Step 1 — Set your Groq API key (optional, defaults are set)

```bash
export GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
export JWT_SECRET=your_super_secret_key
```

### Step 2 — Build and start all containers

```bash
cd Assignment-3

docker-compose up --build
```

This starts **3 containers**:
| Container | Port | Description |
|-----------|------|-------------|
| `notewise-mongo` | 27017 | MongoDB database |
| `notewise-server` | 5000 | Express API |
| `notewise-client` | 80 | React app (via nginx) |

Open your browser → **http://localhost**

### Step 3 — Stop containers

```bash
docker-compose down

# To also delete the MongoDB volume (wipes data):
docker-compose down -v
```

### Useful Docker commands

```bash
# View running containers
docker ps

# View logs for a specific container
docker logs notewise-server -f
docker logs notewise-client -f
docker logs notewise-mongo -f

# Rebuild a single service (e.g. after code change)
docker-compose up --build server

# Open a shell inside the server container
docker exec -it notewise-server sh
```

---

## ☸️ Running with Kubernetes (Minikube)

### Prerequisites
- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- [kubectl](https://kubernetes.io/docs/tasks/tools/) installed
- Docker Desktop running

### Step 1 — Start Minikube

```bash
minikube start
```

### Step 2 — Point Docker to Minikube's registry

> This lets Minikube use locally built images without pushing to Docker Hub.

```bash
eval $(minikube docker-env)
```

### Step 3 — Build Docker images inside Minikube

```bash
# Build server image
docker build -t notewise-server:latest ./server

# Build client image
docker build -t notewise-client:latest ./client
```

### Step 4 — Update secrets (optional)

Edit `k8s/secret.yaml` and replace the values with your own base64-encoded secrets, or just use the defaults.

### Step 5 — Apply all Kubernetes manifests

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongo-deployment.yaml
kubectl apply -f k8s/server-deployment.yaml
kubectl apply -f k8s/client-deployment.yaml
```

### Step 6 — Verify everything is running

```bash
# Check all pods in the notewise namespace
kubectl get pods -n notewise

# Check services
kubectl get services -n notewise

# Wait until all pods show STATUS = Running
kubectl get pods -n notewise -w
```

### Step 7 — Access the app

```bash
minikube service client-service -n notewise
```

This opens the app in your browser automatically via the NodePort (30080).

### Step 8 — Tear down

```bash
# Delete all resources in the namespace
kubectl delete namespace notewise

# Stop minikube
minikube stop
```

### Useful Kubernetes commands

```bash
# Get all resources in notewise namespace
kubectl get all -n notewise

# View logs of a pod
kubectl logs -n notewise <pod-name> -f

# Get pod name (copy from get pods)
kubectl get pods -n notewise

# Describe a pod (debug crashes/errors)
kubectl describe pod -n notewise <pod-name>

# Open a shell inside a running pod
kubectl exec -it -n notewise <pod-name> -- sh

# Scale a deployment
kubectl scale deployment server-deployment --replicas=3 -n notewise

# Check events (useful for debugging)
kubectl get events -n notewise --sort-by='.lastTimestamp'
```

---

## 🔐 Security Notes

- The `.env` file is **gitignored** — never commit it.
- The Groq API key and JWT secret in `docker-compose.yml` / `k8s/secret.yaml` are **defaults for development only**.
- In production, use proper secret management (Docker Secrets, Kubernetes Secrets from Vault, etc.).

---

## 📦 Environment Variables Reference

| Variable | Description | Default (dev) |
|----------|-------------|---------------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | set in `.env` |
| `GROQ_API_KEY` | Groq API key | set in `.env` |
| `JWT_SECRET` | JWT signing secret | `notewise_jwt_secret_key_2026` |
