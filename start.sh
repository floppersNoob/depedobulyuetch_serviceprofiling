#!/bin/bash

echo "=========================================="
echo "=== Starting application setup ==="
echo "=========================================="

# Clear all cached config - important for env vars to work
echo "Clearing cache..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Show current directory and database path
echo "Current directory: $(pwd)"
echo "Database path from env: $DB_DATABASE"

# Create all required directories with proper permissions
echo "Creating directories..."
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/framework/views
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage
chmod -R 777 /var/www/html/bootstrap/cache
echo "Directories created."

# Create SQLite database if it doesn't exist
echo "Checking database..."
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "Creating SQLite database..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database created."
else
    echo "Database already exists."
fi

# Check if migrations folder exists and has files
echo "Checking migrations folder..."
if [ -d "/var/www/html/database/migrations" ] && [ "$(ls -A /var/www/html/database/migrations 2>/dev/null)" ]; then
    echo "Migrations folder exists and has files"
    MIGRATION_PATH="/var/www/html/database/migrations"
else
    echo "Migrations folder is empty or missing - checking for backup"
    # Check if we have migrations in a backup location
    if [ -d "/var/www/html/migrations_backup" ]; then
        echo "Found backup migrations, restoring..."
        mkdir -p /var/www/html/database/migrations
        cp -r /var/www/html/migrations_backup/* /var/www/html/database/migrations/
        MIGRATION_PATH="/var/www/html/database/migrations"
    else
        echo "WARNING: No migrations found!"
    fi
fi

# Run migrations fresh (ensures all tables exist)
echo "=========================================="
echo "Running migrations..."
echo "=========================================="
php artisan migrate:fresh --force --path=$MIGRATION_PATH 2>&1 || php artisan migrate:fresh --force 2>&1
echo "=========================================="
echo "Migrations complete."
echo "=========================================="

# Create admin user using single-line command
echo "Creating admin user..."
php artisan tinker --execute="\\App\\Models\\User::create(['name'=>'Administrator','email'=>'dpwh_admin@dpwh.local','password'=>bcrypt('dpwh_2026')]);" 2>&1 || echo "User creation failed - may already exist"
echo "User setup complete."

echo "=========================================="
echo "=== Starting PHP server ==="
echo "=========================================="
# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
