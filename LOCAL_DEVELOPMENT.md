# Development Without Docker

## 🚀 Setup for XAMPP/Local Development

This project can run without Docker using your existing XAMPP installation or any local PHP/MySQL setup.

---

## ✅ Prerequisites

### Required Software

1. **XAMPP** (or similar)
   - PHP 8.2+
   - MySQL 8.0+
   - Apache/Nginx
   
2. **Composer** - [Download](https://getcomposer.org/download/)

3. **Node.js 20+** - [Download](https://nodejs.org/)

4. **Flutter SDK 3.35+** - [Download](https://docs.flutter.dev/get-started/install)

5. **Git** - [Download](https://git-scm.com/downloads)

### PHP Extensions Required

Ensure these extensions are enabled in `php.ini`:

```ini
extension=mbstring
extension=pdo_mysql
extension=zip
extension=gd
extension=curl
extension=fileinfo
extension=openssl
extension=redis  # Optional, for Redis support
```

---

## 🔧 Installation Steps

### 1. Start XAMPP Services

- Start **Apache** (or Nginx)
- Start **MySQL**
- Optionally install **Redis** for caching

### 2. Create Database

```sql
-- Access phpMyAdmin at http://localhost/phpmyadmin
CREATE DATABASE barber_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 3. Configure Laravel

```bash
# Navigate to project
cd c:\xampp\htdocs\kerrar

# Copy environment file
copy .env.example .env

# Edit .env file with your database credentials
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=barber_db
# DB_USERNAME=root
# DB_PASSWORD=  # Your MySQL password

# Install dependencies
composer install

# Generate application key
php artisan key:generate

# Run migrations
php artisan migrate --seed

# Link storage
php artisan storage:link
```

### 4. Install Frontend Dependencies

```bash
# React/Vite
npm install

# Flutter
cd frontend
flutter pub get
cd ..
```

### 5. Build Assets

```bash
# Build for production
npm run build

# Or run in development mode
npm run dev
```

---

## 🚀 Running the Application

### Option 1: Using Composer Scripts (Recommended)

```bash
# Run all development servers concurrently
composer run dev
```

This starts:
- Laravel development server (port 8000)
- Queue worker
- Vite dev server (port 5173)
- Laravel Pail (log viewer)

### Option 2: Manual Start

```bash
# Terminal 1: Laravel Server
php artisan serve

# Terminal 2: Queue Worker (if using queues)
php artisan queue:work

# Terminal 3: Vite Dev Server
npm run dev

# Terminal 4: Log Viewer (optional)
php artisan pail
```

### Option 3: Using XAMPP Apache

1. Ensure project is in `c:\xampp\htdocs\kerrar`
2. Access via: `http://localhost/kerrar/public`
3. Or configure virtual host (see below)

---

## 🌐 Apache Virtual Host Configuration

### Windows (XAMPP)

Edit `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:

```apache
<VirtualHost *:80>
    ServerName barber.local
    DocumentRoot "C:/xampp/htdocs/kerrar/public"
    
    <Directory "C:/xampp/htdocs/kerrar/public">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog "logs/barber-error.log"
    CustomLog "logs/barber-access.log" common
</VirtualHost>
```

Edit `C:\Windows\System32\drivers\etc\hosts` (as Administrator):

```
127.0.0.1    barber.local
```

Restart Apache and access: `http://barber.local`

---

## 🗄️ Database Management

### Using phpMyAdmin

Access: `http://localhost/phpmyadmin`

### Using CLI

```bash
# Access MySQL
mysql -u root -p

# Use database
USE barber_db;

# Show tables
SHOW TABLES;

# Dump database
mysqldump -u root -p barber_db > backup.sql

# Import database
mysql -u root -p barber_db < backup.sql
```

---

## 📱 Flutter Development

```bash
cd frontend

# Get dependencies
flutter pub get

# Run on Android
flutter run

# Run on Chrome/Web
flutter run -d chrome

# Build APK
flutter build apk --debug

# Build for web
flutter build web
```

---

## ⚡ Performance Optimization

### Laravel Optimization

```bash
# Cache configuration
php artisan config:cache

# Cache routes
php artisan route:cache

# Cache views
php artisan view:cache

# Optimize autoloader
composer dump-autoload --optimize
```

### Clear Caches

```bash
# Clear all caches
php artisan optimize:clear

# Or individually
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan cache:clear
```

---

## 🔄 Queue Workers

### Start Queue Worker

```bash
# Run once
php artisan queue:work

# Run with auto-reload on code changes
php artisan queue:work --tries=3

# Process specific queue
php artisan queue:work --queue=high,default
```

### Supervisor Setup (Linux Production)

Create `/etc/supervisor/conf.d/barber-worker.conf`:

```ini
[program:barber-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=2
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/worker.log
```

### Windows Task Scheduler

Create a scheduled task to run every minute:

```bash
php C:\xampp\htdocs\kerrar\artisan schedule:run
```

---

## 🧪 Testing

```bash
# Run all tests
php artisan test

# Run specific test
php artisan test --filter UserTest

# Run with coverage
php artisan test --coverage

# Static analysis
composer run phpstan

# Code formatting
./vendor/bin/pint
```

---

## 🔧 Common Issues & Solutions

### Port Already in Use

```bash
# Check what's using port 8000
netstat -ano | findstr :8000

# Use different port
php artisan serve --port=8001
```

### Storage Permission Issues

```bash
# Windows (as Administrator)
icacls storage /grant Users:F /T
icacls bootstrap\cache /grant Users:F /T

# Linux/Mac
chmod -R 775 storage bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
```

### MySQL Connection Refused

1. Check if MySQL is running in XAMPP
2. Verify credentials in `.env`
3. Use `127.0.0.1` instead of `localhost`
4. Check firewall settings

### Composer Install Fails

```bash
# Update Composer
composer self-update

# Clear cache
composer clear-cache

# Install with verbose output
composer install -vvv
```

### NPM Install Issues

```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## 📊 Monitoring & Debugging

### Laravel Telescope (Development)

```bash
# Install Telescope
composer require laravel/telescope --dev

# Publish assets
php artisan telescope:install
php artisan migrate

# Access at: http://localhost:8000/telescope
```

### Laravel Horizon (Queue Dashboard)

```bash
# Install Horizon
composer require laravel/horizon

# Publish assets
php artisan horizon:install

# Start Horizon
php artisan horizon

# Access at: http://localhost:8000/horizon
```

### Debug Mode

Enable in `.env`:

```env
APP_DEBUG=true
LOG_LEVEL=debug
```

View logs:

```bash
# Real-time logs
php artisan pail

# Or view log file
tail -f storage/logs/laravel.log
```

---

## 🚀 Deployment (Production)

### Prepare for Deployment

```bash
# Set production environment
APP_ENV=production
APP_DEBUG=false

# Optimize
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
npm run build
```

### Using Deployment Script

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh production
```

### Manual Deployment Steps

1. Pull latest code: `git pull origin main`
2. Install dependencies: `composer install --no-dev`
3. Run migrations: `php artisan migrate --force`
4. Build assets: `npm run build`
5. Clear caches: `php artisan optimize:clear`
6. Cache config: `php artisan config:cache`
7. Restart queue: `php artisan queue:restart`

---

## 📚 Useful Commands Reference

```bash
# Laravel
php artisan list                  # List all commands
php artisan tinker                # Interactive shell
php artisan route:list            # Show all routes
php artisan migrate:status        # Check migrations
php artisan make:model Post -mcr  # Create model with migration, controller, resource

# Composer
composer update                   # Update dependencies
composer dump-autoload            # Regenerate autoloader
composer show                     # List installed packages

# NPM
npm run dev                       # Development server
npm run build                     # Production build
npm run lint                      # Lint code
npm outdated                      # Check outdated packages

# Flutter
flutter doctor                    # Check setup
flutter clean                     # Clean build
flutter pub upgrade               # Upgrade dependencies
```

---

## 🔒 Security Checklist

- [ ] Change default database password
- [ ] Set `APP_DEBUG=false` in production
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Set proper file permissions
- [ ] Enable CSRF protection
- [ ] Use environment variables for secrets
- [ ] Regular backups of database
- [ ] Monitor logs for errors

---

## 📞 Getting Help

- Check Laravel logs: `storage/logs/laravel.log`
- Enable debug mode temporarily
- Check XAMPP logs
- Review CI/CD documentation
- Check GitHub Actions runs for deployment issues

---

**Ready to develop!** Start with `composer run dev` and access your app at `http://localhost:8000` 🚀
