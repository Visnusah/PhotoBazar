#!/bin/bash

echo "🔧 Setting up PhotoBazaar Database..."

# Set PostgreSQL bin path
export PATH="/opt/homebrew/bin:$PATH"

# Start PostgreSQL if not running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🚀 Starting PostgreSQL..."
    brew services start postgresql
    sleep 3
fi

# Get current user
CURRENT_USER=$(whoami)
echo "👤 Current user: $CURRENT_USER"

# Create database as current user
echo "🗄️  Creating database 'photobazaar'..."
createdb photobazaar 2>/dev/null && echo "✅ Database created successfully!" || echo "⚠️  Database may already exist"

# Create postgres role with password
echo "👥 Setting up postgres user..."
psql -d photobazaar -c "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'kamlesh@123' SUPERUSER CREATEDB;
        GRANT ALL PRIVILEGES ON DATABASE photobazaar TO postgres;
    ELSE
        ALTER USER postgres WITH PASSWORD 'kamlesh@123';
    END IF;
END
\$\$;
" && echo "✅ User 'postgres' configured successfully!" || echo "⚠️  User setup may have failed"

# Grant privileges to current user as well
echo "🔐 Granting privileges..."
psql -d photobazaar -c "GRANT ALL PRIVILEGES ON DATABASE photobazaar TO $CURRENT_USER;" 2>/dev/null

echo "✅ Database setup complete!"
echo "🔍 Testing connections..."

# Test connection as current user
if psql -d photobazaar -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection as $CURRENT_USER: SUCCESS"
else
    echo "❌ Connection as $CURRENT_USER: FAILED"
fi

# Test connection as postgres user
if PGPASSWORD='kamlesh@123' psql -h localhost -U postgres -d photobazaar -c "SELECT 1;" > /dev/null 2>&1; then
    echo "✅ Connection as postgres: SUCCESS"
else
    echo "❌ Connection as postgres: FAILED"
fi

echo "🚀 Ready to initialize database tables!"
echo "Run: npm run db:init"
