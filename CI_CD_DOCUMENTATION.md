# CI/CD Workflow Documentation

## 🚀 Professional DevOps Setup for Multi-Stack Project

This project implements a comprehensive CI/CD pipeline for:
- **Backend**: Laravel 12 (PHP 8.2)
- **Frontend**: React 19 with Vite
- **Mobile**: Flutter 3.35

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [GitHub Actions Workflows](#github-actions-workflows)
3. [Docker Configuration](#docker-configuration)
4. [Deployment Scripts](#deployment-scripts)
5. [Environment Setup](#environment-setup)
6. [Security & Secrets](#security--secrets)
7. [Best Practices](#best-practices)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│  (Laravel + React + Flutter in Monorepo Structure)          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │   GitHub Actions CI/CD   │
        └────────────┬────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────┐         ┌──────────────┐
│  Laravel CI   │         │  React CI    │
│  - Lint       │         │  - Lint      │
│  - Test       │         │  - Build     │
│  - Security   │         │  - Deploy    │
│  - Deploy     │         └──────────────┘
└───────────────┘                 │
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  Flutter CI  │          │  Production  │
│  - Analyze   │          │  Environment │
│  - Test      │          │  - Docker    │
│  - Build     │          │  - K8s       │
│  - Deploy    │          │  - CDN       │
└──────────────┘          └──────────────┘
```

---

## 🔄 GitHub Actions Workflows

### 1. Laravel CI/CD (`.github/workflows/laravel-ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

**Jobs:**

#### Code Quality
- PHP 8.2 setup with extensions
- Composer dependency caching
- Laravel Pint code style check
- PHPStan static analysis

#### Tests
- MySQL 8.0 and Redis services
- Full test suite with coverage (min 70%)
- Database migrations
- Coverage report artifacts

#### Security
- Composer security audit
- Dependency vulnerability scanning

#### Deploy (Production)
- Runs only on `main` branch
- Production optimized build
- Automated deployment artifact creation
- Deployment summary

**Usage:**
```bash
# Trigger manually
gh workflow run laravel-ci.yml

# View workflow status
gh run list --workflow=laravel-ci.yml
```

---

### 2. React CI/CD (`.github/workflows/react-ci.yml`)

**Triggers:**
- Changes to `resources/js/**`, `package.json`, Vite config
- Pull requests

**Jobs:**

#### Lint & Format
- Prettier formatting check
- ESLint code quality

#### Type Check
- TypeScript type validation (if configured)

#### Test
- Jest/Vitest test execution
- Coverage reporting

#### Build
- Production asset compilation
- Build size analysis
- Artifact upload for deployment

#### Security Audit
- npm audit for vulnerabilities
- Outdated package detection

#### Lighthouse (PR only)
- Performance audits
- Accessibility checks
- Best practices validation

#### Deploy
- Staging: `develop` branch
- Production: `main` branch

---

### 3. Flutter CI/CD (`.github/workflows/flutter-ci.yml`)

**Triggers:**
- Changes to `frontend/**`
- Manual dispatch with platform selection

**Jobs:**

#### Analyze
- Dart format verification
- Flutter analyze
- Custom lint rules

#### Test
- Unit & widget tests
- Code coverage
- Codecov integration

#### Build Android
- Debug & Release APK
- App Bundle for Play Store
- Multi-ABI builds
- Keystore signing (production)

#### Build iOS
- Debug & Release builds
- CocoaPods dependencies
- Provisioning profile setup
- IPA generation

#### Build Web
- CanvasKit renderer
- Optimized production build

#### Deploy
- **Android Internal**: `develop` → Play Store Internal Testing
- **Android Production**: `main` → Play Store Beta
- **iOS**: TestFlight deployment
- **Web**: Firebase Hosting / Vercel / Netlify

**Platform Selection:**
```bash
# Build all platforms
gh workflow run flutter-ci.yml -f platform=all

# Build specific platform
gh workflow run flutter-ci.yml -f platform=android
```

---

## 🚀 Direct Server Deployment

### Server Requirements

- **PHP**: 8.2+ with required extensions (mbstring, pdo, mysql, gd, zip, redis)
- **MySQL**: 8.0+
- **Redis**: 7.0+ (for cache and queues)
- **Node.js**: 20+
- **Composer**: Latest
- **Web Server**: Nginx or Apache

### Server Setup

```bash
# Install PHP extensions (Ubuntu/Debian)
sudo apt install php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
  php8.2-xml php8.2-zip php8.2-gd php8.2-redis php8.2-curl

# Install Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs
```

### Nginx Configuration

See `docker/nginx/default.conf` for production Nginx configuration example.

---

## 📜 Deployment Scripts

### 1. Deploy Script (`scripts/deploy.sh`)

Automates zero-downtime deployment:

```bash
./scripts/deploy.sh production
```

**Process:**
1. Enable maintenance mode
2. Create backup
3. Pull latest code
4. Install dependencies
5. Build assets
6. Run migrations
7. Cache optimization
8. Restart queue workers
9. Fix permissions
10. Disable maintenance mode

### 2. Rollback Script (`scripts/rollback.sh`)

Quick rollback to previous version:

```bash
./scripts/rollback.sh backup_20240115_143022.tar.gz
```

### 3. Health Check Script (`scripts/health-check.sh`)

Monitors application health:

```bash
./scripts/health-check.sh
```

**Checks:**
- Web service availability
- Database connectivity
- Redis connectivity
- Queue workers status
- Disk space usage

**Setup monitoring:**
```bash
# Add to crontab
*/5 * * * * /var/www/html/scripts/health-check.sh
```

---

## ⚙️ Environment Setup

### Required Environment Variables

#### Laravel (.env)
```env
APP_ENV=production
APP_DEBUG=false
APP_KEY=base64:...

DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=barber_db
DB_USERNAME=root
DB_PASSWORD=strong_password

REDIS_HOST=redis
REDIS_PORT=6379

QUEUE_CONNECTION=redis
CACHE_DRIVER=redis
SESSION_DRIVER=redis
```

#### Flutter (frontend/.env)
```env
API_BASE_URL=https://api.your-domain.com
API_KEY=your_api_key
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### GitHub Repository Secrets

Navigate to: **Settings → Secrets and variables → Actions**

#### Laravel Secrets
- `DEPLOY_HOST` - Production server hostname
- `DEPLOY_USER` - SSH username
- `DEPLOY_KEY` - SSH private key

#### Android Secrets
- `ANDROID_KEYSTORE_BASE64` - Base64 encoded keystore
- `ANDROID_KEYSTORE_PASSWORD` - Keystore password
- `ANDROID_KEY_PASSWORD` - Key password
- `ANDROID_KEY_ALIAS` - Key alias
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` - Play Store API key

#### iOS Secrets
- `IOS_CERTIFICATE_BASE64` - Base64 encoded certificate
- `IOS_CERTIFICATE_PASSWORD` - Certificate password
- `IOS_PROVISIONING_PROFILE_BASE64` - Provisioning profile

#### Firebase/Deployment
- `FIREBASE_SERVICE_ACCOUNT` - Firebase deployment token
- `VERCEL_TOKEN` - Vercel deployment token

---

## 🔒 Security & Secrets

### Encoding Secrets

```bash
# Android Keystore
base64 -i keystore.jks | pbcopy

# iOS Certificate
base64 -i certificate.p12 | pbcopy

# Provisioning Profile
base64 -i profile.mobileprovision | pbcopy
```

### SSH Key Setup

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "deployment@barber-app"

# Add public key to server
ssh-copy-id -i ~/.ssh/deployment.pub user@server

# Add private key to GitHub Secrets (DEPLOY_KEY)
cat ~/.ssh/deployment | pbcopy
```

---

## ✅ Best Practices

### 1. Branch Strategy

```
main          → Production (auto-deploy)
develop       → Staging (auto-deploy)
feature/*     → Feature branches (CI checks only)
hotfix/*      → Hotfix branches (urgent fixes)
```

### 2. Commit Messages

Follow Conventional Commits:

```
feat: add user authentication
fix: resolve video upload timeout
docs: update API documentation
test: add integration tests for payments
refactor: optimize database queries
chore: update dependencies
```

### 3. Pull Request Workflow

1. Create feature branch
2. Make changes
3. Push and create PR
4. CI checks run automatically
5. Code review
6. Merge to develop (staging deployment)
7. Test on staging
8. Merge to main (production deployment)

### 4. Monitoring & Alerts

Configure in `scripts/health-check.sh`:

```bash
# Slack webhook
export SLACK_WEBHOOK="https://hooks.slack.com/services/..."

# Email alerts
export ALERT_EMAIL="ops@your-domain.com"
```

### 5. Performance Optimization

**Laravel:**
```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

**React:**
```bash
npm run build -- --mode production
```

**Flutter:**
```bash
flutter build apk --split-per-abi --release
```

### 6. Database Backups

```bash
# Automated daily backups
0 2 * * * mysqldump -u root -p$DB_PASSWORD barber_db | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Retention (keep 30 days)
0 3 * * * find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

---

## 🚦 Getting Started

### 1. Initial Setup

```bash
# Clone repository
git clone https://github.com/anmar1986/barbers.git
cd barbers

# Copy environment file
cp .env.example .env

# Configure .env with your database credentials
# DB_HOST=localhost (or 127.0.0.1)
# DB_DATABASE=barber_db
# DB_USERNAME=root
# DB_PASSWORD=your_password

# Install dependencies
composer install
php artisan key:generate
php artisan migrate --seed

# Install frontend dependencies
npm install
cd frontend && flutter pub get

# Start development
php artisan serve
npm run dev
```

### 2. Configure GitHub Secrets

Add all required secrets in GitHub repository settings.

### 3. Test Workflows

```bash
# Create a test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add .
git commit -m "test: verify CI/CD pipeline"
git push origin test/ci-pipeline

# Check Actions tab in GitHub
```

### 4. Deploy to Production

```bash
# Merge to main branch
git checkout main
git merge develop
git push origin main

# Monitor deployment
gh run watch
```

---

## 📊 Monitoring & Logging

### Application Logs

```bash
# Laravel logs
tail -f storage/logs/laravel.log

# Web server logs (Nginx)
tail -f /var/log/nginx/error.log

# Queue worker logs
tail -f storage/logs/worker.log
```

### Metrics & Monitoring

Recommended tools:
- **Application**: Laravel Telescope / Horizon
- **Infrastructure**: Prometheus + Grafana
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot / Pingdom
- **APM**: New Relic / DataDog

---

## 🆘 Troubleshooting

### Workflow Failures

```bash
# View failed workflow
gh run view <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed
```

### Permission Issues

```bash
# Fix Laravel storage permissions (Linux/Mac)
sudo chown -R www-data:www-data storage bootstrap/cache
sudo chmod -R 775 storage bootstrap/cache

# Windows (XAMPP)
# Run Command Prompt as Administrator
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T
```

### Service Issues

```bash
# Restart PHP-FPM
sudo systemctl restart php8.2-fpm

# Restart Nginx
sudo systemctl restart nginx

# Restart Queue workers
php artisan queue:restart
```

---

## 📚 Additional Resources

- [Laravel Deployment Documentation](https://laravel.com/docs/deployment)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Flutter Deployment Guide](https://docs.flutter.dev/deployment)

---

## 📝 License

This project is licensed under the MIT License.

---

**Maintained by DevOps Team**
Last Updated: November 2025
