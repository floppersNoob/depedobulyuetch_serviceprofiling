#!/bin/bash

# Create SQLite database if it doesn't exist
if [ ! -f /var/www/html/database/database.sqlite ]; then
    touch /var/www/html/database/database.sqlite
    chmod 666 /var/www/html/database/database.sqlite
fi

# Run migrations
php artisan migrate --force

# Seed the database (create admin user)
php artisan db:seed --force

# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
