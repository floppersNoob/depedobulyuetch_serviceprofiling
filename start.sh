#!/bin/bash

echo "=== Starting application setup ==="

# Create all required directories with proper permissions
mkdir -p /var/www/html/storage/framework/sessions
mkdir -p /var/www/html/storage/framework/cache
mkdir -p /var/www/html/storage/logs
chmod -R 777 /var/www/html/storage
chmod -R 777 /var/www/html/bootstrap/cache

# Create SQLite database if it doesn't exist
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "Creating SQLite database..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database created."
fi

# Run migrations fresh (ensures all tables exist)
echo "Running migrations..."
php artisan migrate:fresh --force || echo "Migration warning (may already exist)"
echo "Migrations complete."

# Create admin user using single-line command
echo "Creating admin user..."
php artisan tinker --execute="\\App\\Models\\User::create(['name'=>'Administrator','email'=>'dpwh_admin@dpwh.local','password'=>bcrypt('dpwh_2026')]);" || echo "User may already exist"
echo "User setup complete."

echo "=== Starting PHP server ==="
# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
