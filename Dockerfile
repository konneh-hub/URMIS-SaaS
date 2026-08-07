# =====================================================
# URMIS - Frontend (Next.js) production image
# The Next.js App Router lives under src/app/ (not /app).
# Backend runs as a separate container (Dockerfile.backend).
# =====================================================

FROM node:24-alpine AS deps
WORKDIR /usr/src/app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# =====================================================
FROM node:24-alpine AS builder
WORKDIR /usr/src/app

# Reuse the dependency layer
COPY --from=deps /usr/src/app/node_modules ./node_modules

# Copy application source (Next.js App Router is in src/, NOT app/)
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY backend ./backend
COPY src ./src
COPY public ./public
COPY tsconfig.json next.config.ts postcss.config.mjs ./

# Next.js public API base is baked at build time (browser-facing URL).
ARG NEXT_PUBLIC_API_BASE=http://localhost:5000
ENV NEXT_PUBLIC_API_BASE=$NEXT_PUBLIC_API_BASE
ENV NODE_ENV=production

# Generate Prisma client and build the Next.js production bundle
RUN npx prisma generate
RUN npm run build

# =====================================================
FROM node:24-alpine AS runner
WORKDIR /usr/src/app

ENV NODE_ENV=production

# Run as a non-root user for better security
RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

# Copy the production build and required runtime files
COPY --from=builder /usr/src/app/public ./public
COPY --from=builder /usr/src/app/.next ./.next
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json

# Prisma client is needed at runtime by the frontend build artifacts
COPY --from=builder /usr/src/app/prisma ./prisma
COPY --from=builder /usr/src/app/backend ./backend

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["npm", "run", "start"]
