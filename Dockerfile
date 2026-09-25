# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM node:22-alpine AS builder

WORKDIR /app

RUN apk add --no-cache libc6-compat

# Next.js inlines NEXT_PUBLIC_* vars at build time; pass via --build-arg if needed
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Install dependencies (pnpm is the project's package manager)
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && pnpm install --frozen-lockfile --ignore-scripts

# Copy source and build standalone output
COPY . .
RUN pnpm build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone output: server.js serves public/ and .next/static automatically
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]