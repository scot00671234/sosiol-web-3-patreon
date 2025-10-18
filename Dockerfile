g# Multi-stage build for production

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build backend
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci

COPY backend/ ./
RUN npx prisma generate && npm run build

# Stage 3: Production
FROM node:18-alpine
WORKDIR /app

# Install production dependencies for backend
COPY backend/package*.json ./
RUN npm ci --only=production

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/prisma ./prisma
RUN npx prisma generate

# Copy built frontend to be served
COPY --from=frontend-builder /app/frontend/dist ./public

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]

