FROM php:8.2-apache

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
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_sqlite mbstring exif pcntl bcmath gd zip

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set document root
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
ENV PORT=80

# Update Apache configuration with proper document root
RUN sed -ri 's|/var/www/html|/var/www/html/public|g' /etc/apache2/sites-available/000-default.conf /etc/apache2/sites-available/default-ssl.conf 2>/dev/null || true
RUN sed -ri 's|/var/www/|/var/www/html/public/|g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf 2>/dev/null || true

# Add rewrite rules for Laravel
RUN echo '<Directory /var/www/html/public>\n\
    Options Indexes FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/laravel.conf \
    && a2enconf laravel

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy all files
COPY . .

# Create required directories and set permissions before composer
RUN mkdir -p bootstrap/cache storage/framework/cache storage/framework/sessions storage/framework/views storage/logs database \
    && chmod -R 777 bootstrap/cache storage database

# Install PHP dependencies (without scripts to avoid permission issues during build)
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

# Generate autoload and run discovery
RUN composer dump-autoload --optimize \
    && php artisan package:discover --ansi

# Install Node dependencies and build
RUN npm ci && npm run build

# Cache Laravel configs
RUN php artisan config:cache && php artisan route:cache && php artisan view:cache

# Set proper ownership for Apache
RUN chown -R www-data:www-data /var/www/html

EXPOSE 80

CMD ["apache2-foreground"]
