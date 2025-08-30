# Build stage
FROM node:20-alpine AS builder

# Enable corepack to use pnpm
RUN corepack enable

WORKDIR /app

# Copy package files for workspace setup
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig*.json ./
COPY packages ./packages

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# Build all packages in dependency order
RUN pnpm run build

# Production stage
FROM node:20-alpine AS production

# Enable corepack to use pnpm
RUN corepack enable

WORKDIR /app

# Set default environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    CORS_ORIGIN="*" \
    LOG_LEVEL="info" \
    DB_PATH="/app/data/tinycore.db"

# Copy workspace configuration files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/server/package.json ./packages/server/
COPY packages/shared/package.json ./packages/shared/

# Copy built application files from builder
COPY --from=builder /app/packages/server/dist ./packages/server/dist
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy admin UI from where it actually builds to
COPY --from=builder /app/packages/admin-ui/dist/kv-admin ./packages/server/dist/kv-admin

# Install only production dependencies for the workspace
RUN pnpm install --prod --frozen-lockfile

# Create data directory and set up non-root user
RUN mkdir -p /app/data && \
    addgroup -S nodejs && \
    adduser -S nodeuser -G nodejs && \
    chown -R nodeuser:nodejs /app

# Install wget for health check
RUN apk add --no-cache wget

# Switch to non-root user
USER nodeuser

# Expose the port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT}/api/v1/users/registration-status || exit 1

# Start the server from the correct location
CMD ["node", "packages/server/dist/index.js"]