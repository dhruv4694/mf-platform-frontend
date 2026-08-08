# Dockerfile — React frontend
#
# LAYER CACHING STRATEGY:
#   1. COPY package*.json   → cached unless dependencies change (rare)
#   2. RUN npm ci           → cached unless package.json changes  (rare)
#   3. COPY src/ index.html → cache miss only when source changes (frequent)
#   4. RUN npm run build    → rebuilds only when source changes
#
# This means rebuilding after changing a React component takes ~15 seconds
# instead of 2+ minutes (no re-downloading of node_modules).

# ─── Stage 1: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Layer 1: copy ONLY package files — Docker caches this layer independently.
# npm ci only re-runs when package.json or package-lock.json changes.
COPY package*.json ./
RUN npm ci --silent

# Layer 2: copy source files — cache miss when ANY source file changes.
# Copying selectively (not COPY . .) excludes Dockerfile, nginx.conf, README
# from this layer so changes to those don't invalidate the npm ci cache.
COPY index.html .
COPY vite.config.js .
COPY src ./src

# VITE_API_URL must be available at BUILD time, not runtime — Vite bakes
# import.meta.env.VITE_* values into the compiled JS bundle during `vite
# build`. Passing it as a normal `environment:` entry in docker-compose
# (a runtime-only mechanism) would have no effect on an already-built
# static bundle. Pass it as a build arg instead:
#   docker build --build-arg VITE_API_URL=https://your-backend-host .
# If unset, api/client.js falls back to a relative "/api/v1" path — only
# correct when something in front of nginx proxies /api to the backend
# (this image's nginx.conf does not; see nginx.conf for why).
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build
# Output: /app/dist/

# ─── Stage 2: Runtime ────────────────────────────────────────────────────────
FROM nginx:alpine AS runtime

# Copy built static files from builder — nothing else
COPY --from=builder /app/dist /usr/share/nginx/html

# nginx config: serves the built React app only. It does NOT proxy /api —
# the frontend calls the backend directly via VITE_API_URL, baked in above
# at build time. See nginx.conf for the full explanation.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
