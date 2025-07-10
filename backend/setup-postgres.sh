#!/bin/bash

echo "🔧 Setting up PostgreSQL for PhotoBazaar..."

# Set PostgreSQL bin path
export PATH="/opt/homebrew/bin:$PATH"

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "🚀 Starting PostgreSQL..."
    brew services start postgresql
    sleep 3
fi

# Create database and user setup
echo "🗄️  Setting up database..."

# First, try to create the database as the current user
createdb photobazaar 2>/dev/null || echo "Database may already exist"

# Create a setup SQL script
cat > /tmp/setup_photobazaar.sql << 'EOF'
-- Create user if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'postgres') THEN
        CREATE USER postgres WITH PASSWORD 'kamlesh@123';
        ALTER USER postgres CREATEDB;
        ALTER USER postgres WITH SUPERUSER;
    END IF;
END
$$;

-- Ensure database exists
SELECT 'CREATE DATABASE photobazaar' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'photobazaar')\gexec

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE photobazaar TO postgres;
EOF

# Execute the setup script
psql -d postgres -f /tmp/setup_photobazaar.sql 2>/dev/null || {
    echo "⚠️  Could not set up with default connection. Trying alternative..."
    
    # Try with different connection options
    psql -h localhost -d postgres -f /tmp/setup_photobazaar.sql 2>/dev/null || {
        echo "🔄 Setting up PostgreSQL with peer authentication..."
        
        # For macOS Homebrew PostgreSQL, often no password is needed for local connections
        # Let's modify pg_hba.conf to allow password authentication
        PG_HBA_CONF=$(psql -t -c "SHOW hba_file;" postgres 2>/dev/null | xargs)
        
        if [ -n "$PG_HBA_CONF" ]; then
            echo "📝 Configuring PostgreSQL authentication..."
            # Backup original
            cp "$PG_HBA_CONF" "$PG_HBA_CONF.backup" 2>/dev/null
            
            # Add md5 authentication for local connections
            if ! grep -q "local.*all.*all.*md5" "$PG_HBA_CONF"; then
                echo "local   all             all                                     md5" >> "$PG_HBA_CONF"
            fi
            
            # Restart PostgreSQL
            brew services restart postgresql
            sleep 3
        fi
    }
}

# Clean up
rm -f /tmp/setup_photobazaar.sql

echo "✅ PostgreSQL setup complete!"
echo "🔍 Testing database connection..."

# Test connection
if psql -h localhost -U postgres -d photobazaar -c "SELECT 1;" 2>/dev/null; then
    echo "✅ Database connection successful!"
else
    echo "⚠️  Database connection test failed. You may need to manually configure PostgreSQL."
    echo "   Try running: psql -h localhost -U postgres -d photobazaar"
fi
