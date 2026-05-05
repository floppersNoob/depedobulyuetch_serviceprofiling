FROM php:8.2-cli

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    libsqlite3-dev \
    sqlite3 \
    dos2unix \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd zip

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . .

# Backup migrations folder (Railway volume mount overwrites database folder)
RUN cp -r /var/www/html/database/migrations /var/www/html/migrations_backup

# Create required directories and set permissions
RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs database \
    && chmod -R 777 bootstrap/cache storage database

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Generate autoload and run discovery
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi

# Install Node dependencies and build
RUN npm ci && npm run build

# Copy startup script and convert line endings
COPY start.sh /start.sh
RUN dos2unix /start.sh && chmod +x /start.sh

# Expose port (Railway sets PORT env var)
EXPOSE 80

# Start using startup script (creates DB at runtime)
CMD ["/bin/bash", "/start.sh"]
