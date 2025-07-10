#!/bin/bash

echo "🚀 PhotoBazaar Local Database Setup"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL is not installed!"
    print_info "Install PostgreSQL:"
    print_info "  macOS: brew install postgresql"
    print_info "  Ubuntu: sudo apt-get install postgresql postgresql-contrib"
    print_info "  Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

print_status "PostgreSQL is installed"

# Check if PostgreSQL service is running
if pg_isready -q; then
    print_status "PostgreSQL service is running"
else
    print_warning "PostgreSQL service is not running"
    print_info "Start PostgreSQL service:"
    print_info "  macOS: brew services start postgresql"
    print_info "  Ubuntu: sudo systemctl start postgresql"
    print_info "  Windows: Use Services or start from pgAdmin"
    
    # Try to start on macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        print_info "Attempting to start PostgreSQL..."
        brew services start postgresql
        sleep 3
        if pg_isready -q; then
            print_status "PostgreSQL started successfully"
        else
            print_error "Failed to start PostgreSQL automatically"
            exit 1
        fi
    else
        exit 1
    fi
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found"
    if [ -f .env.example ]; then
        cp .env.example .env
        print_status ".env file created from template"
        print_warning "Please update the database password in .env file"
    else
        print_error ".env.example not found. Please create .env file manually"
        exit 1
    fi
fi

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Set defaults if not provided
DB_NAME=${DB_NAME:-photobazaar}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

print_info "Database configuration:"
print_info "  Host: $DB_HOST"
print_info "  Port: $DB_PORT"
print_info "  Database: $DB_NAME"
print_info "  User: $DB_USER"

# Test connection to PostgreSQL
echo ""
print_info "Testing PostgreSQL connection..."

if [ -z "$DB_PASSWORD" ]; then
    print_warning "No password set in .env file"
    print_info "Trying to connect without password..."
    PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT version();" > /dev/null 2>&1
else
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT version();" > /dev/null 2>&1
fi

if [ $? -eq 0 ]; then
    print_status "Successfully connected to PostgreSQL"
else
    print_error "Failed to connect to PostgreSQL"
    print_info "Please check:"
    print_info "  1. PostgreSQL is running"
    print_info "  2. Username and password are correct"
    print_info "  3. pgAdmin4 connection settings"
    exit 1
fi

# Create database if it doesn't exist
echo ""
print_info "Creating database '$DB_NAME'..."

if [ -z "$DB_PASSWORD" ]; then
    PGPASSWORD="" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null
else
    PGPASSWORD="$DB_PASSWORD" createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" 2>/dev/null
fi

if [ $? -eq 0 ]; then
    print_status "Database '$DB_NAME' created successfully"
elif [ $? -eq 2 ]; then
    print_status "Database '$DB_NAME' already exists"
else
    print_error "Failed to create database '$DB_NAME'"
    exit 1
fi

# Test connection to the new database
echo ""
print_info "Testing connection to database '$DB_NAME'..."

if [ -z "$DB_PASSWORD" ]; then
    PGPASSWORD="" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT current_database();" > /dev/null 2>&1
else
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT current_database();" > /dev/null 2>&1
fi

if [ $? -eq 0 ]; then
    print_status "Successfully connected to database '$DB_NAME'"
else
    print_error "Failed to connect to database '$DB_NAME'"
    exit 1
fi

echo ""
print_status "Database setup completed successfully!"
print_info "Next steps:"
print_info "  1. Update .env file with your database password if needed"
print_info "  2. Run: npm run db:init (to create tables and seed data)"
print_info "  3. Run: npm run dev (to start the development server)"

echo ""
print_info "pgAdmin4 connection settings:"
print_info "  Host: $DB_HOST"
print_info "  Port: $DB_PORT"
print_info "  Database: $DB_NAME"
print_info "  Username: $DB_USER"
print_info "  Password: [your password from .env file]"
