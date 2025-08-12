# Multi-stage build for Nori Healthcare
FROM node:20-slim as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci --prefer-offline

# Copy source code
COPY . .

# Build the application using our working script
RUN node simple-build.cjs

# Production stage
FROM node:20-slim as production

WORKDIR /app

# Copy built application
COPY --from=builder /app/dist .

# Install only production dependencies
RUN npm install --production --no-audit

# Expose port
EXPOSE 5000

# Set environment to production
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"]