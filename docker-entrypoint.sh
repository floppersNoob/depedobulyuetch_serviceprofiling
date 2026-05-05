#!/bin/bash
set -e

# Create SQLite database if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
    chown www-data:www-data /var/www/html/database/database.sqlite
fi

# Run migrations
cd /var/www/html
php artisan migrate --force || true

# Clear and cache config
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Execute the main command
exec "$@"
