# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for both server and client
COPY package.json yarn.lock tsconfig*.json ./
COPY src ./src
COPY kv-admin ./kv-admin

# Install dependencies and build both server and client
RUN yarn install --frozen-lockfile && \
    # Build server
    yarn build && \
    # Build client (assuming there's a script in root package.json)
    yarn build:client && \
    # Clean up
    yarn cache clean && \
    rm -rf /usr/local/share/.cache/yarn && \
    rm -rf node_modules

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Set default environment variables
ENV NODE_ENV=production \
    PORT=3000 \
    CORS_ORIGIN="*" \
    LOG_LEVEL="info" \
    DB_PATH="/app/data/tinycore.db"

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies and clean up in one layer
RUN yarn install --production --frozen-lockfile --network-timeout 100000 && \
    yarn cache clean && \
    rm -rf /usr/local/share/.cache/yarn

# Copy built files from builder stage - both server and client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist/kv-admin ./dist/kv-admin

# Create a non-root user
RUN addgroup -S nodejs && \
    adduser -S nodeuser -G nodejs && \
    chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose the port
EXPOSE ${PORT}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD wget -q --spider http://localhost:${PORT}/health || exit 1

USER root

# TODO Work out how to run as non-root user
# Start the server
CMD ["node", "dist/index.js"]