#!/bin/bash

echo "=========================================="
echo "=== Starting application setup ==="
echo "=========================================="

# Show current directory
echo "Current directory: $(pwd)"
echo "Database path: /var/www/html/storage/database.sqlite"

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

# Run migrations fresh (ensures all tables exist)
echo "=========================================="
echo "Running migrations..."
echo "=========================================="
php artisan migrate:fresh --force
echo "=========================================="
echo "Migrations complete."
echo "=========================================="

# Create admin user using single-line command
echo "Creating admin user..."
php artisan tinker --execute="\\App\\Models\\User::create(['name'=>'Administrator','email'=>'dpwh_admin@dpwh.local','password'=>bcrypt('dpwh_2026')]);"
echo "User setup complete."

echo "=========================================="
echo "=== Starting PHP server ==="
echo "=========================================="
# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
