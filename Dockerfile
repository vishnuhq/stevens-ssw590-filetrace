# ============================================
# Stage 1: Build Stage - Install Dependencies
# ============================================
FROM node:24-alpine AS build

# Set working directory
WORKDIR /app

# Update npm to fix glob CVE-2025-64756 (vulnerable versions 10.4.5, 11.0.3 in base image)
RUN npm install -g npm@latest

# Copy package files for dependency installation
# Copy only package files first to leverage Docker layer caching
COPY server/package*.json ./

# Install production dependencies only
# - npm ci: Clean install using package-lock.json (deterministic builds)
# - --only=production: Exclude devDependencies (smaller image, fewer security risks)
# - npm cache clean: Remove npm cache to reduce image size
RUN npm ci --only=production && \
    npm cache clean --force

# ============================================
# Stage 2: Production Stage - Runtime Image
# ============================================
FROM node:24-alpine

# Install dumb-init for proper signal handling
# dumb-init runs as PID 1 and forwards signals to Node.js process
# This ensures graceful shutdown and proper cleanup
RUN apk add --no-cache dumb-init

# Remove npm to fix CVE-2025-64756 (glob vulnerability in npm's dependencies)
# npm is not needed at runtime - we only run 'node server.js'
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

# Create non-root user for security (Principle of Least Privilege)
# Running as root violates security best practices
# UID/GID 1001 to avoid conflicts with existing system users
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Set working directory
WORKDIR /app

# Copy node_modules from build stage with proper ownership
# --from=build: Copy from previous stage
# --chown=nodejs:nodejs: Ensure files are owned by non-root user
COPY --from=build --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source code with proper ownership
# This includes all server files: config/, routes/, utils/, etc.
COPY --chown=nodejs:nodejs server/ ./

# Set environment to production
# This optimizes Express.js and other frameworks for production
ENV NODE_ENV=production

# Switch to non-root user
# All subsequent commands and the container runtime will use this user
USER nodejs

# Expose application port
# This is documentation - actual port binding happens at runtime
EXPOSE 3001

# Health check configuration
# Checks if the server is responding and can connect to external services
# - interval=30s: Check every 30 seconds
# - timeout=5s: Wait max 5 seconds for response
# - start-period=30s: Give app 30 seconds to start before first check
# - retries=3: Mark unhealthy after 3 consecutive failures
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (r) => { \
    let data = ''; \
    r.on('data', chunk => data += chunk); \
    r.on('end', () => { \
    try { \
    const health = JSON.parse(data); \
    process.exit(health.status === 'healthy' ? 0 : 1); \
    } catch(e) { \
    process.exit(1); \
    } \
    }); \
    }).on('error', () => process.exit(1));"

# Use dumb-init as entrypoint for proper signal handling
# The "--" separates dumb-init args from the command
ENTRYPOINT ["dumb-init", "--"]

# Start the application
# server.js is the entry point (NOT index.js or app.js)
CMD ["node", "server.js"]
