#!/bin/bash

# Deployment Script for Production Server
# Usage: ./deploy.sh [environment]

set -e

ENVIRONMENT=${1:-production}
PROJECT_DIR="/var/www/html"
BACKUP_DIR="/var/backups/app"
DATE=$(date +%Y%m%d_%H%M%S)

echo "🚀 Starting deployment to $ENVIRONMENT environment..."

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# 1. Enable Maintenance Mode
echo "📝 Enabling maintenance mode..."
php artisan down --retry=60

# 2. Backup current version
echo "💾 Creating backup..."
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" \
    --exclude='storage/logs/*' \
    --exclude='storage/framework/cache/*' \
    --exclude='storage/framework/sessions/*' \
    --exclude='storage/framework/views/*' \
    --exclude='node_modules' \
    --exclude='vendor' \
    $PROJECT_DIR

# 3. Pull latest code
echo "📥 Pulling latest code..."
git fetch origin
git reset --hard origin/main

# 4. Install/Update Composer dependencies
echo "📦 Installing Composer dependencies..."
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev

# 5. Install/Update Node dependencies and build assets
echo "🎨 Building frontend assets..."
npm ci --only=production
npm run build

# 6. Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# 7. Clear and cache config
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# 8. Restart queue workers
echo "🔄 Restarting queue workers..."
php artisan queue:restart

# 9. Fix permissions
echo "🔒 Setting permissions..."
chown -R www-data:www-data $PROJECT_DIR
chmod -R 755 $PROJECT_DIR/storage
chmod -R 755 $PROJECT_DIR/bootstrap/cache

# 10. Disable Maintenance Mode
echo "✅ Disabling maintenance mode..."
php artisan up

# 11. Clean old backups (keep last 10)
echo "🧹 Cleaning old backups..."
cd $BACKUP_DIR
ls -tp | grep -v '/$' | tail -n +11 | xargs -I {} rm -- {}

echo "🎉 Deployment completed successfully at $(date)"
echo "📊 Backup saved to: $BACKUP_DIR/backup_$DATE.tar.gz"
