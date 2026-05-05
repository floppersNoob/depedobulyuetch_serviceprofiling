#!/bin/bash
set -e

echo "=== Starting application setup ==="

# Create SQLite database in storage folder (not database folder - volume mount overwrites it)
if [ ! -f /var/www/html/storage/database.sqlite ]; then
    echo "Creating SQLite database..."
    touch /var/www/html/storage/database.sqlite
    chmod 666 /var/www/html/storage/database.sqlite
    echo "Database created."
fi

# Run migrations fresh (ensures all tables exist)
echo "Running migrations..."
php artisan migrate:fresh --force
echo "Migrations complete."

# Create admin user directly (skip seeder - volume mount overwrites seeders folder)
echo "Creating admin user..."
php artisan tinker --execute="
\App\Models\User::create([
    'name' => 'Administrator',
    'email' => 'dpwh_admin@dpwh.local',
    'password' => \Illuminate\Support\Facades\Hash::make('dpwh_2026'),
]);
echo 'Admin user created successfully.';
"
echo "User setup complete."

echo "=== Starting PHP server ==="
# Start PHP server
php artisan serve --host 0.0.0.0 --port ${PORT:-80}
