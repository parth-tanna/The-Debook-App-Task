# Development stage
FROM node:20-alpine AS development
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

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

# Copy migrations if they are not compiled into dist (they are in dist, so this is fine)
# But we might need the TS config if we run migrations via ts-node, 
# strictly for production we should run migrations from JS files.
# For simplicity, we'll copy the dist folder which contains migrations.

EXPOSE 3000

# Start command
CMD ["node", "dist/main"]
