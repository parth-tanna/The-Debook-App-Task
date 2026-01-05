#!/bin/sh

# Exit on error
set -e

echo "Running migrations..."
npm run migration:run

echo "Starting application..."
exec "$@"
