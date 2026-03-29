# ─── Stage 1: Install dependencies ────────────────────────────────────
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production image ────────────────────────────────────────
FROM node:18-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S notewise && adduser -S notewise -G notewise

# Copy only production dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Remove .env from image (will be injected via docker-compose/env vars)
RUN rm -f .env

# Switch to non-root user
USER notewise

EXPOSE 5000

CMD ["node", "index.js"]
