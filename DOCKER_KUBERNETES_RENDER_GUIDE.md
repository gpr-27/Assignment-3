# Docker, Kubernetes, and Render Deployment Guide for MERN

This guide explains what to do after finishing a MERN app, using this project as the reference.

## 1) What to Use and When

- Use Docker when you want a simple, reproducible deployment package.
- Use Kubernetes when you need orchestration at scale (multiple replicas, rolling updates, autoscaling, advanced networking).
- For Render in this project: use Docker deployment, not Kubernetes manifests.

Why: Render Web Services run your app directly from source or a Dockerfile. You do not deploy your own Kubernetes manifests (`k8s/*.yaml`) to Render Web Service.

## 2) Prerequisites

Install these tools on macOS:

```bash
brew install node
brew install --cask docker
brew install colima
brew install kubectl
brew install minikube
```

Start Docker runtime (Colima):

```bash
colima start
```

Verify:

```bash
docker ps
kubectl version --client
```

Create one root `.env` file (same level as `Dockerfile`) for shared app variables:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/notewise
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your_jwt_secret_key
```

## 3) Docker Setup After MERN App Is Ready

Your project already has:

- `Dockerfile` (multi-stage build)
- `docker-compose.yml` (app + mongo)

### 3.1 Build and Run with Compose (Recommended Local Container Flow)

From repository root:

```bash
docker compose up --build
```

Access app at:

- `http://localhost:5000`

Stop:

```bash
docker compose down
```

### 3.2 Run Standalone Container (Without Compose)

Build image:

```bash
docker build -t notewise:latest .
```

Run container:

```bash
docker run -p 5000:5000 \
  -e MONGO_URI="your_mongodb_uri" \
  -e GROQ_API_KEY="your_groq_key" \
  -e JWT_SECRET="your_jwt_secret" \
  -e PORT=5000 \
  notewise:latest
```

## 4) Kubernetes Setup After MERN App Is Ready

This project already includes Kubernetes manifests in `k8s/`:

- `k8s/mongo.yaml`
- `k8s/app.yaml`
- `k8s/secret.yaml`

### 4.1 Start Local Cluster

```bash
minikube start
```

### 4.2 Build Image for Minikube

Use Minikube Docker daemon:

```bash
eval "$(minikube docker-env)"
docker build -t notewise:latest .
```

### 4.3 Create/Apply Secrets

If `k8s/secret.yaml` is template-based, apply with real values or create by command:

```bash
kubectl create secret generic notewise-secrets \
  --from-literal=GROQ_API_KEY="your_groq_key" \
  --from-literal=JWT_SECRET="your_jwt_secret"
```

### 4.4 Deploy

```bash
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/app.yaml
```

### 4.5 Verify and Access

```bash
kubectl get pods
kubectl get svc
minikube service notewise
```

## 5) Render Deployment: Docker or Kubernetes?

For this project on Render:

- Use Docker (`Dockerfile`) for deployment.
- Do not use Kubernetes manifests for Render Web Service deployment.

### 5.1 Recommended Render Steps

1. Push repository to GitHub.
2. In Render, create a new Web Service.
3. Connect repository.
4. Choose Docker environment (Render detects `Dockerfile`).
5. Set environment variables in Render dashboard:
   - `MONGO_URI`
   - `GROQ_API_KEY`
   - `JWT_SECRET`
   - `PORT` (optional on Render; Render provides port via env)
6. Deploy.

## 6) Practical Decision Rule

- If your target is Render Web Service: choose Docker.
- If your target is GKE/EKS/AKS or self-managed cluster: choose Kubernetes.
- For local development with minimal setup: use `docker compose up --build`.

## 7) Common Errors and Quick Fixes

### Docker socket error on macOS

Error like:

- `failed to connect to docker API ... colima ... docker.sock`

Fix:

```bash
colima start
docker ps
```

### Port already in use

If `5000` is busy, stop process or map a different host port:

```bash
docker run -p 5001:5000 ...
```

### Kubernetes pods stuck in `ImagePullBackOff`

Build image inside Minikube daemon:

```bash
eval "$(minikube docker-env)"
docker build -t notewise:latest .
```

## 8) Final Recommendation for Your Assignment

- Use Docker Compose for local demonstration.
- Use Dockerfile-based deploy for Render.
- Keep Kubernetes section as an advanced/orchestration showcase, not the primary Render deploy path.
