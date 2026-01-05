#!/bin/bash

# Start services
echo "Starting Docker services..."
docker compose up -d --build

# Wait for services to be ready
echo "Waiting for services to initialize..."
sleep 10

# Run migrations
echo "Running migrations..."
docker compose exec app npm run migration:run

echo "------------------------------------------------"
echo "App is running at http://localhost:3000"
echo "------------------------------------------------"
