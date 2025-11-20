# Barber Social Platform - CI/CD Setup

## 🚀 Quick Start

### Prerequisites Check

**Windows/XAMPP Users:**
```bash
scripts\check-versions.bat
```

**Linux/Mac Users:**
```bash
chmod +x scripts/check-versions.sh
./scripts/check-versions.sh
```

### Run Tests Before Pushing

**Backend (Laravel):**
```bash
composer test && composer phpstan && vendor/bin/pint --test
```

**Frontend (Flutter):**
```bash
cd frontend
flutter test && flutter analyze
```

**Web (React):**
```bash
npm run lint && npm run build
```

---

## 📚 Documentation

- **[Complete CI/CD Guide](.github/workflows/README.md)** - Full documentation
- **[Quick Reference](.github/CICD_QUICK_REFERENCE.md)** - Common commands
- **[Secrets Setup](.github/SECRETS.md)** - GitHub Actions secrets (future use)

---

## 🔄 Workflows

### Automatic Triggers
All workflows run automatically on push/PR to `main` or `develop` branches.

### Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select "Full Stack CI/CD Pipeline"
3. Click **Run workflow**

---

## 📦 What Gets Tested

### Laravel Backend (`laravel-backend.yml`)
- ✓ Unit & Feature tests (PHP 8.2, 8.3)
- ✓ Code style (Laravel Pint)
- ✓ Static analysis (PHPStan)
- ✓ Security audit (Composer)
- ✓ MySQL database tests

### Flutter Mobile (`flutter-mobile.yml`)
- ✓ Code analysis & formatting
- ✓ Unit tests with coverage
- ✓ Android APK build
- ✓ Android App Bundle build
- ✓ iOS build (no codesign)

### React Web (`react-web.yml`)
- ✓ ESLint checks
- ✓ Vite production build
- ✓ Bundle size analysis

---

## 🛠️ Technology Stack

| Component | Version | CI Version |
|-----------|---------|------------|
| **Backend** |
| PHP | 8.2+ | 8.2, 8.3 |
| Laravel | 12.0 | 12.0 |
| MySQL | 8.0 | 8.0 |
| Composer | 2.x | 2.x |
| **Mobile** |
| Flutter | 3.27.1 | 3.27.1 |
| Dart | 3.0+ | 3.0+ |
| **Web** |
| Node.js | 20.x | 20.x |
| React | 19.2.0 | 19.2.0 |
| Vite | 7.0.7 | 7.0.7 |

---

## ⚙️ Configuration Files

### Environment Files
- `.env` - Local development (XAMPP/localhost)
- `.env.testing` - Local testing (SQLite)
- `.env.ci` - GitHub Actions CI (MySQL)
- `.env.example` - Template for new environments

### Lock Files (Always commit these!)
- `composer.lock` - PHP dependencies
- `package-lock.json` - Node dependencies
- `frontend/pubspec.lock` - Flutter dependencies

---

## 🎯 Workflow Status

Check your workflow status:
- Repository → **Actions** tab
- View logs for each job
- Download build artifacts

### Status Badges (Add to main README)

```markdown
![Laravel Backend](https://github.com/anmar1986/barbers/workflows/Laravel%20Backend%20CI%2FCD/badge.svg)
![Flutter Mobile](https://github.com/anmar1986/barbers/workflows/Flutter%20Mobile%20App%20CI%2FCD/badge.svg)
![React Web](https://github.com/anmar1986/barbers/workflows/React%20Web%20App%20CI%2FCD/badge.svg)
```

---

## 🐛 Troubleshooting

### Common Issues

**Tests fail in CI but pass locally:**
- Check PHP/Node/Flutter versions match
- Verify lock files are committed
- Check environment variables

**Composer/npm install fails:**
- Clear cache in Actions → Caches
- Check for corrupted lock files
- Verify network connectivity

**Flutter build fails:**
- Run `flutter clean` and `flutter pub get`
- Check for conflicting generated files
- Verify SDK version matches CI

---

## 📋 Pre-Push Checklist

- [ ] All tests pass locally
- [ ] Code formatted and linted
- [ ] Lock files committed
- [ ] No sensitive data in code
- [ ] Environment variables updated if needed

---

## 🔐 Security

- ✓ No secrets required for basic CI/CD
- ✓ All dependencies audited
- ✓ Static analysis enabled
- ✓ Security scanning on every push

---

## 📈 Next Steps

1. **Run version checker:** `scripts\check-versions.bat`
2. **Push code:** Git will trigger workflows automatically
3. **Monitor:** Check Actions tab for results
4. **Download:** Build artifacts available for 30 days

---

## 📞 Support

- Check [workflow documentation](.github/workflows/README.md)
- Review [quick reference](.github/CICD_QUICK_REFERENCE.md)
- Examine workflow logs in Actions tab
- Verify local environment matches CI versions

---

**Last Updated:** November 2025  
**Repository:** anmar1986/barbers  
**Branch:** main
