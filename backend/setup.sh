#!/bin/bash

echo "🚀 Setting up PhotoBazaar Backend..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL first."
    echo "For macOS: brew install postgresql"
    echo "For Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create database (you may need to adjust this based on your PostgreSQL setup)
echo "🗄️  Creating database..."
createdb photobazaar 2>/dev/null || echo "Database may already exist"

# Initialize database with tables and seed data
echo "🌱 Initializing database..."
npm run db:init

echo "🎉 Setup complete! You can now run:"
echo "  npm run dev    # Start development server"
echo "  npm start      # Start production server"
echo ""
echo "🌐 API will be available at: http://localhost:5000"
echo "📚 API documentation: Check README.md for endpoints"
