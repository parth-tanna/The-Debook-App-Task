# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Add entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Use entrypoint to run migrations
ENTRYPOINT ["./docker-entrypoint.sh"]

# Default command for dev
CMD ["npm", "run", "start:dev"]

# Build stage
FROM development AS builder
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./

# Install only production dependencies
RUN npm install --only=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/docker-entrypoint.sh ./

EXPOSE 3000

# Use entrypoint to run migrations
ENTRYPOINT ["./docker-entrypoint.sh"]

# Default command
CMD ["node", "dist/main"]
