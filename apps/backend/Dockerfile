# Build stage
FROM node:22-alpine as builder

# Set shell and environment variables
ENV SHELL=/bin/sh
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install pnpm
RUN apk add --no-cache bash && \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    SHELL=/bin/bash pnpm setup

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with husky
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Runner stage
FROM node:slim as runner

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set shell and environment variables
ENV SHELL=/bin/sh
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:${PATH}"

# Install pnpm
RUN apk add --no-cache bash && \
    corepack enable && \
    corepack prepare pnpm@latest --activate && \
    SHELL=/bin/bash pnpm setup

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies
RUN HUSKY=0 pnpm install --prod --frozen-lockfile --ignore-scripts

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/config ./src/config

RUN chown -R appuser:appgroup /app

USER appuser

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/main"]
