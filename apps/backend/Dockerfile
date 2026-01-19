# --------------------
# Build stage
# --------------------
FROM node:22-alpine AS builder

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files
COPY apps/backend/package.json ./
COPY pnpm-lock.yaml ./

# Install all deps
RUN pnpm install --no-frozen-lockfile

# Copy source
COPY apps/backend/src ./src
COPY apps/backend/nest-cli.json apps/backend/tsconfig*.json ./

# Build
RUN pnpm run build


# --------------------
# Runner stage
# --------------------
FROM node:22-alpine AS runner

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

ENV NODE_ENV=production
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Enable pnpm (no bash, no apk needed)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy dependency files
COPY apps/backend/package.json ./
COPY pnpm-lock.yaml ./

# Install prod-only deps
RUN HUSKY=0 pnpm install --prod --no-frozen-lockfile --ignore-scripts

# Copy build output
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/config ./src/config

# Permissions
RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 3000

CMD ["pnpm", "start:prod"]
