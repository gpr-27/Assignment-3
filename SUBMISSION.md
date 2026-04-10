# CS515 Unix Programming — Assignment 03 Submission

**Student Name**: ************\_\_\_\_************  
**Roll No.**: **************\_\_\_\_**************  
**Section/Batch**: ************\_\_\_************  
**Deadline**: 29-03-2026

## GitHub Link

- **Repository (public)**: **************\_\_\_\_**************

---

## Project Overview

**NoteWise** is a two-tier web application that helps users analyze study notes (paste text / upload PDF) and generate AI-powered outputs like summaries, bullet points, flashcards, quizzes, and mind maps.

- **Frontend**: React + Vite + TailwindCSS (built and served as static files)
- **Backend**: Node.js + Express (serves API + static frontend)
- **Database**: MongoDB
- **AI Provider**: Groq (`llama-3.3-70b-versatile`) via `GROQ_API_KEY`

---

## Phase 1 — Git (Version Control)

### Repository Setup

- The project is tracked in Git with incremental commits (no monolithic “finished project” commit).

### Required Command

```bash
git log --oneline
```

### Screenshot Placeholder — `git log --oneline`

> Paste screenshot here

---

## Phase 2 — Docker (Containerization)

This repository contains:

- **`Dockerfile`**: multi-stage build (builds the client, installs server prod deps, serves app on port `5000`)
- **`docker-compose.yml`**: runs `mongo:7` and the app together

### Option A: Run locally with Docker Compose (recommended for local Docker)

1. From the repository root:

```bash
docker compose up --build
```

2. Open the app:

- **URL**: `http://localhost:5000`

### Option B: Build and run with Docker only

1. Build the image:

```bash
docker build -t notewise:latest .
```

2. Run MongoDB:

```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```

3. Run the app container:

```bash
docker run --rm -p 5000:5000 \
  -e PORT=5000 \
  -e MONGO_URI="mongodb://host.docker.internal:27017/notewise" \
  -e GROQ_API_KEY="REPLACE_ME" \
  -e JWT_SECRET="REPLACE_ME" \
  notewise:latest
```

---

## Phase 3 — Kubernetes (Minikube Orchestration)

This repository contains Kubernetes manifests in `k8s/`:

- **`k8s/mongo.yaml`**: MongoDB Deployment + Service
- **`k8s/app.yaml`**: App Deployment (**replicas: 2**) + NodePort Service
- **`k8s/secret.yaml`**: Secret for `GROQ_API_KEY` and `JWT_SECRET`

### Step-by-Step Instructions (exact commands)

1. Start Minikube:

```bash
minikube start
```

2. Point Docker CLI to Minikube’s Docker daemon (so the image is available inside the cluster):

```bash
eval $(minikube docker-env)
```

3. Build the application image inside Minikube:

```bash
docker build -t notewise:latest .
```

4. Set secrets (**choose one approach**):

**Approach 1 — edit and apply `k8s/secret.yaml`:**

- Open `k8s/secret.yaml` and replace:
  - `GROQ_API_KEY: "REPLACE_ME"`
  - `JWT_SECRET: "REPLACE_ME"`

Then apply:

```bash
kubectl apply -f k8s/secret.yaml
```

**Approach 2 — create the secret via command (no file edit):**

```bash
kubectl create secret generic notewise-secrets \
  --from-literal=GROQ_API_KEY="REPLACE_ME" \
  --from-literal=JWT_SECRET="REPLACE_ME"
```

5. Apply MongoDB resources:

```bash
kubectl apply -f k8s/mongo.yaml
```

6. Apply the application resources:

```bash
kubectl apply -f k8s/app.yaml
```

7. Verify pods are running:

```bash
kubectl get pods
```

### Screenshot Placeholder — `kubectl get pods`

> Paste screenshot here

### Access the application

The service is exposed via NodePort.

Option A — open via Minikube helper:

```bash
minikube service notewise
```

Option B — open directly using NodePort (as defined in `k8s/app.yaml`):

- **NodePort**: `30500`
- **URL (typical)**: `http://$(minikube ip):30500`

---

## Proof of Execution — Final Application Running

### Screenshot Placeholder — App running in browser

> Paste screenshot here (show NoteWise UI loaded successfully)

---

## Notes / Assumptions

- The Kubernetes app container listens on **port `5000`**.
- The app uses MongoDB service DNS **`mongo`** inside the cluster:
  - `MONGO_URI=mongodb://mongo:27017/notewise`
- `GROQ_API_KEY` and `JWT_SECRET` are supplied through the `notewise-secrets` Secret.
