#!/bin/bash

# Rollback Script
# Usage: ./rollback.sh [backup_file]

set -e

BACKUP_FILE=$1
PROJECT_DIR="/var/www/html"
BACKUP_DIR="/var/backups/app"

if [ -z "$BACKUP_FILE" ]; then
    echo "Available backups:"
    ls -lh $BACKUP_DIR
    echo ""
    echo "Usage: ./rollback.sh [backup_file]"
    exit 1
fi

if [ ! -f "$BACKUP_DIR/$BACKUP_FILE" ]; then
    echo "❌ Backup file not found: $BACKUP_DIR/$BACKUP_FILE"
    exit 1
fi

echo "⚠️  Rolling back to backup: $BACKUP_FILE"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Rollback cancelled."
    exit 0
fi

# Enable maintenance mode
echo "📝 Enabling maintenance mode..."
php artisan down --retry=60

# Extract backup
echo "📦 Extracting backup..."
cd $PROJECT_DIR
tar -xzf "$BACKUP_DIR/$BACKUP_FILE"

# Run migrations down if needed
echo "🗄️ Rolling back migrations..."
php artisan migrate:rollback --force

# Clear caches
echo "🧹 Clearing caches..."
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear

# Restart queue workers
echo "🔄 Restarting queue workers..."
php artisan queue:restart

# Disable maintenance mode
echo "✅ Disabling maintenance mode..."
php artisan up

echo "✅ Rollback completed successfully!"
