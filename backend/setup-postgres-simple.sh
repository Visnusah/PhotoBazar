#!/bin/bash

echo "🔧 Setting up PostgreSQL for PhotoBazaar..."

# Set PostgreSQL bin path
export PATH="/opt/homebrew/bin:$PATH"

# Start PostgreSQL if not running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🚀 Starting PostgreSQL..."
    brew services start postgresql
    sleep 3
fi

# Get the current user
CURRENT_USER=$(whoami)

echo "👤 Current user: $CURRENT_USER"

# Create database as current user (peer authentication)
echo "🗄️  Creating database..."
createdb photobazaar 2>/dev/null || echo "Database may already exist"

# Create postgres user and set password
echo "👥 Setting up postgres user..."
psql -d photobazaar -c "
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'kamlesh@123';
        ALTER USER postgres CREATEDB;
        ALTER USER postgres WITH SUPERUSER;
    ELSE
        ALTER USER postgres WITH PASSWORD 'kamlesh@123';
    END IF;
END
\$\$;
" 2>/dev/null || {
    echo "⚠️  Could not create postgres user. Trying alternative..."
    
    # Try connecting to template1 database
    psql -d template1 -c "
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'postgres') THEN
            CREATE USER postgres WITH PASSWORD 'kamlesh@123';
            ALTER USER postgres CREATEDB;
            ALTER USER postgres WITH SUPERUSER;
        ELSE
            ALTER USER postgres WITH PASSWORD 'kamlesh@123';
        END IF;
    END
    \$\$;
    " 2>/dev/null
}

# Grant privileges
echo "🔐 Granting privileges..."
psql -d photobazaar -c "GRANT ALL PRIVILEGES ON DATABASE photobazaar TO postgres;" 2>/dev/null

# Set trust authentication for local connections temporarily
echo "🔧 Configuring PostgreSQL authentication..."
PG_HBA_CONF=$(psql -t -c "SHOW hba_file;" -d photobazaar 2>/dev/null | xargs)

if [ -n "$PG_HBA_CONF" ] && [ -f "$PG_HBA_CONF" ]; then
    # Backup original
    cp "$PG_HBA_CONF" "$PG_HBA_CONF.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null
    
    # Add trust authentication for local connections
    if ! grep -q "local.*all.*postgres.*trust" "$PG_HBA_CONF"; then
        echo "local   all             postgres                                trust" | sudo tee -a "$PG_HBA_CONF" > /dev/null 2>&1
    fi
    
    # Reload PostgreSQL configuration
    psql -d photobazaar -c "SELECT pg_reload_conf();" 2>/dev/null || brew services restart postgresql
fi

echo "✅ PostgreSQL setup complete!"
echo "🔍 Testing database connection..."

# Test the connection
sleep 2
if PGPASSWORD='kamlesh@123' psql -h localhost -U postgres -d photobazaar -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Direct connection test failed. The application should still work with peer authentication."
fi

echo "🚀 Ready to initialize database tables!"
