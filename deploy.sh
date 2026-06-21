#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "🚀 Starting local deployment process..."

# Pull the latest changes if it's a git repository (optional, commented out by default)
# echo "📥 Pulling latest changes from git..."
# git pull origin main

echo "🛑 Stopping currently running containers..."
docker compose down

echo "🔨 Building Docker images..."
docker compose build

echo "🏃 Starting Docker containers in detached mode..."
docker compose up -d

echo "✅ Local deployment successful!"
echo "🌐 Frontend is available at: http://localhost:4321"
echo "🔌 Backend API is available at: http://localhost:8000"
echo "🗄️  MongoDB is running on port: 27017"
