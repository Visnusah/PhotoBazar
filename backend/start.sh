#!/bin/bash

# PhotoBazaar Backend Quick Start Script
echo "🚀 Starting PhotoBazaar Backend Server..."
echo "========================================"

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend directory"
    echo "   cd /Users/sanju/Downloads/photobazaar/backend"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please create a .env file with the required environment variables"
    echo "   See AUTHENTICATION_SUMMARY.md for configuration details"
    exit 1
fi

# Verify database schema
echo "🔍 Verifying database schema..."
node verify-schema.js

if [ $? -eq 0 ]; then
    echo "✅ Database schema verified"
else
    echo "❌ Database schema verification failed"
    exit 1
fi

# Start the server
echo "🌐 Starting server on port ${PORT:-5000}..."
echo "   Health check: http://localhost:${PORT:-5000}/health"
echo "   API endpoint: http://localhost:${PORT:-5000}/api"
echo ""
echo "📋 Available endpoints:"
echo "   POST /api/auth/register - User registration"
echo "   POST /api/auth/login    - User login"
echo "   GET  /api/auth/profile  - Get user profile"
echo "   PUT  /api/auth/profile  - Update profile"
echo "   GET  /api/auth/verify   - Verify token"
echo ""
echo "Press Ctrl+C to stop the server"
echo "=================================="

# Start with nodemon if available, otherwise use node
if command -v nodemon &> /dev/null; then
    nodemon server.js
else
    node server.js
fi
