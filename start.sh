#!/bin/bash
set -e

echo "=== Starting application setup ==="

# Create SQLite database if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    echo "Creating SQLite database..."
    touch /var/www/html/database/database.sqlite
    chmod 666 /var/www/html/database/database.sqlite
    echo "Database created."
fi

# Run migrations
echo "Running migrations..."
php artisan migrate --force
echo "Migrations complete."

# Seed the database (create admin user)
echo "Seeding database..."
php artisan db:seed --force
echo "Seeding complete."

echo "=== Starting PHP server ==="
# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
