# Quick Start Guide for CI/CD

## 🚀 Getting Started with CI/CD

### Prerequisites

1. **GitHub Account** with admin access to repository
2. **Docker** installed locally (for testing)
3. **Git** configured with SSH keys

---

## ⚙️ Initial Setup

### 1. Configure GitHub Secrets

Go to: **Repository → Settings → Secrets and variables → Actions → New repository secret**

Add these secrets (minimum required):

```
# For Laravel deployment (if using SSH)
DEPLOY_HOST=your-server-ip
DEPLOY_USER=deployment-user
DEPLOY_KEY=<your-ssh-private-key>

# For Android builds (optional, for release only)
ANDROID_KEYSTORE_BASE64=<base64-encoded-keystore>
ANDROID_KEYSTORE_PASSWORD=your-keystore-password
ANDROID_KEY_PASSWORD=your-key-password
ANDROID_KEY_ALIAS=your-key-alias
```

### 2. Enable GitHub Actions

1. Go to **Actions** tab in GitHub
2. Click "I understand my workflows, go ahead and enable them"
3. Workflows will run automatically on push/PR

### 3. Test the Workflows

```bash
# Create a test branch
git checkout -b test/ci-pipeline

# Make a small change
echo "# Testing CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: CI/CD pipeline"
git push origin test/ci-pipeline

# Create Pull Request and watch Actions tab
```

---

## 🔄 Workflow Triggers

### Automatic Triggers

| Branch | Event | What Happens |
|--------|-------|--------------|
| `main` | Push | Full CI + Production deployment |
| `develop` | Push | Full CI + Staging deployment |
| Any | Pull Request | CI checks only (no deployment) |

### Manual Triggers

```bash
# Run specific workflow manually
gh workflow run laravel-ci.yml
gh workflow run flutter-ci.yml -f platform=android
```

---

## 💻 Local Development

### Start Development Environment

```bash
# First time setup
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
npm install

# Start development servers
composer run dev
# This runs: Laravel server, Queue worker, Vite
```

### Access Services

- **Laravel Application**: http://localhost:8000
- **Vite Dev Server**: http://localhost:5173
- **MySQL**: localhost:3306 (via XAMPP)
- **phpMyAdmin**: http://localhost/phpmyadmin

### Useful Commands

```bash
# Run artisan commands
php artisan tinker

# Queue worker
php artisan queue:work

# Development server
php artisan serve

# Build assets
npm run build
```

---

## 📱 Flutter Development

### Setup

```bash
cd frontend
flutter pub get
flutter run
```

### Build Commands

```bash
# Android Debug
flutter build apk --debug

# Android Release (requires signing setup)
flutter build apk --release

# iOS (macOS only)
flutter build ios --release

# Web
flutter build web --release
```

---

## 🔧 Common Tasks

### Run Tests Locally

```bash
# Laravel tests
docker-compose exec app php artisan test

# Flutter tests
cd frontend && flutter test

# React tests (if configured)
npm test
```

### Code Quality Checks

```bash
# Laravel Pint (formatting)
./vendor/bin/pint

# PHPStan (static analysis)
composer run phpstan

# Flutter analyze
cd frontend && flutter analyze

# Dart format
cd frontend && dart format .
```

### Update Dependencies

```bash
# PHP dependencies
composer update

# Node dependencies
npm update

# Flutter dependencies
cd frontend && flutter pub upgrade
```

---

## 🚀 Deployment Process

### To Staging (develop branch)

```bash
git checkout develop
git merge feature/your-feature
git push origin develop

# Automatically deploys to staging
```

### To Production (main branch)

```bash
git checkout main
git merge develop
git push origin main

# Automatically deploys to production
# Requires manual approval if configured
```

### Manual Deployment

```bash
# SSH to server
ssh user@your-server

# Run deployment script
cd /var/www/html
./scripts/deploy.sh production
```

---

## 🆘 Troubleshooting

### Workflow Failed

1. Check **Actions** tab for error details
2. Review logs for specific job
3. Fix issue and push again
4. Or re-run failed jobs:
   ```bash
   gh run rerun <run-id> --failed
   ```

### Permission Issues

```bash
# Windows (run as administrator)
icacls storage /grant Users:F /T
icacls bootstrap/cache /grant Users:F /T

# Linux/Mac
chmod -R 775 storage bootstrap/cache
```

### Database Connection Failed

```bash
# Check if MySQL is running (XAMPP)
# Start XAMPP Control Panel and ensure MySQL is running

# Check connection
php artisan tinker
>>> DB::connection()->getPdo();

# Reset database
php artisan migrate:fresh --seed
```

---

## 📊 Monitoring Deployments

### GitHub CLI

```bash
# Install GitHub CLI
# Windows: winget install GitHub.cli
# Mac: brew install gh

# Watch workflow run
gh run watch

# List recent runs
gh run list

# View specific run
gh run view <run-id>
```

### GitHub Actions Tab

1. Go to **Actions** tab
2. Select workflow run
3. View job details and logs
4. Download artifacts if needed

---

## 🔐 Security Best Practices

1. **Never commit secrets** to repository
2. Use GitHub Secrets for sensitive data
3. Rotate secrets periodically
4. Use environment-specific secrets
5. Enable branch protection rules
6. Require PR reviews before merge

---

## 📚 Next Steps

1. ✅ Review and customize workflows for your needs
2. ✅ Configure production server details
3. ✅ Set up monitoring and alerts
4. ✅ Configure automatic backups
5. ✅ Set up SSL certificates
6. ✅ Configure CDN for static assets
7. ✅ Set up error tracking (Sentry)

---

## 📖 Additional Documentation

- [Full CI/CD Documentation](CI_CD_DOCUMENTATION.md)
- [Laravel Documentation](https://laravel.com/docs)
- [Flutter Documentation](https://docs.flutter.dev)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Need Help?** Check the detailed [CI_CD_DOCUMENTATION.md](CI_CD_DOCUMENTATION.md) file.
