# CI/CD Workflows Documentation

This directory contains GitHub Actions workflows for automated testing and quality assurance. These workflows run on every push and pull request to ensure code quality and prevent regressions.

## Overview

| Workflow | Purpose | Triggers |
|----------|---------|----------|
| **laravel-ci.yml** | PHP/Laravel testing and code quality | Changes to PHP files, config, database |
| **react-ci.yml** | React linting and build verification | Changes to JavaScript/JSX files |
| **flutter-ci.yml** | Flutter testing and mobile app builds | Changes to Flutter frontend |

---

## Laravel CI Workflow

**File:** `.github/workflows/laravel-ci.yml`

### What it does:
- **Tests** - Runs PHPUnit tests on multiple PHP versions (8.2, 8.3)
- **Code Style** - Validates code style with Laravel Pint
- **Static Analysis** - Analyzes code with PHPStan (level 5)

### Jobs:
1. **laravel-tests** - Runs on PHP 8.2 and 8.3
   - Sets up Laravel environment
   - Runs database migrations (SQLite)
   - Executes PHPUnit tests in parallel

2. **code-quality** - Runs on PHP 8.2
   - Laravel Pint: Checks code follows Laravel style guide
   - PHPStan: Static analysis to catch potential bugs

### Local Testing:
```bash
# Run tests
php artisan test

# Check code style
./vendor/bin/pint --test

# Run static analysis
composer phpstan
```

---

## React CI Workflow

**File:** `.github/workflows/react-ci.yml`

### What it does:
- **Linting** - Runs ESLint on React components
- **Build** - Verifies production build completes successfully
- Tests on Node.js 20.x and 22.x

### Jobs:
1. **lint-and-build**
   - Installs npm dependencies
   - Runs ESLint with strict rules
   - Builds production assets with Vite
   - Uploads build artifacts (Node 20.x only)

### Local Testing:
```bash
# Install dependencies (if needed)
npm install

# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Build production assets
npm run build
```

### ESLint Configuration:
The project uses a modern ESLint 9+ flat config (`eslint.config.js`) with:
- React recommended rules
- React Hooks rules
- React Refresh plugin for HMR

---

## Flutter CI Workflow

**File:** `.github/workflows/flutter-ci.yml`

### What it does:
- **Analysis** - Runs Flutter analyzer and format checks
- **Testing** - Executes Flutter unit and widget tests
- **Build** - Builds Android APK and iOS app (no codesign)
- Tests on Flutter 3.24.x and stable

### Jobs:

1. **analyze-and-test**
   - Runs Flutter analyze
   - Checks code formatting
   - Executes tests with coverage
   - Runs code generation (build_runner)

2. **build-android** (runs after tests pass)
   - Builds release APK
   - Uploads APK artifact

3. **build-ios** (runs after tests pass)
   - Builds iOS app without codesigning
   - Uploads build info

### Local Testing:
```bash
cd frontend

# Install dependencies
flutter pub get

# Run code generation
flutter pub run build_runner build --delete-conflicting-outputs

# Analyze code
flutter analyze

# Check formatting
dart format --set-exit-if-changed lib test

# Run tests
flutter test

# Build Android
flutter build apk --release

# Build iOS (macOS only)
flutter build ios --release --no-codesign
```

---

## Environment Variables & Secrets

### Required for Flutter Workflows:
The Flutter workflow creates a basic `.env` file for testing. For production, you'll need to add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

Recommended secrets:
- `API_BASE_URL` - Your production API URL
- `API_KEY` - API authentication key
- Any other environment-specific variables

### To use secrets in workflow:
```yaml
- name: Create .env file
  run: |
    echo "API_BASE_URL=${{ secrets.API_BASE_URL }}" > .env
    echo "API_KEY=${{ secrets.API_KEY }}" >> .env
```

---

## Workflow Triggers

All workflows trigger on:
- **Push** to `main` or `develop` branches
- **Pull Requests** to `main` or `develop` branches

### Path Filters:
Workflows only run when relevant files change:
- Laravel CI: PHP files, config, database, tests
- React CI: JavaScript/JSX, CSS, package files
- Flutter CI: Files in `frontend/` directory

---

## Caching Strategy

All workflows use caching to speed up CI runs:

| Workflow | Cached Items |
|----------|--------------|
| Laravel | Composer dependencies |
| React | npm packages, node_modules |
| Flutter | Pub cache, .dart_tool |

This reduces build times by 50-70% on subsequent runs.

---

## Matrix Testing

### Laravel:
- PHP 8.2, 8.3

### React:
- Node.js 20.x, 22.x

### Flutter:
- Flutter 3.24.x, stable

Matrix testing ensures compatibility across different versions.

---

## Artifacts

Workflows upload build artifacts for review:

| Workflow | Artifact | Retention |
|----------|----------|-----------|
| React | build-artifacts (Vite build output) | 5 days |
| Flutter | android-apk (Release APK) | 5 days |
| Flutter | coverage-report (Test coverage) | 5 days |
| Flutter | ios-build-info (Build info) | 5 days |

Access artifacts from the Actions tab → Select workflow run → Artifacts section

---

## Best Practices

### Before Pushing:
1. Run tests locally: `php artisan test`
2. Check code style: `./vendor/bin/pint --test`
3. Run static analysis: `composer phpstan`
4. Lint React code: `npm run lint`
5. Format Flutter code: `dart format lib test`

### Fixing CI Failures:

**Laravel Pint Issues:**
```bash
# Auto-fix style issues
./vendor/bin/pint
```

**PHPStan Errors:**
```bash
# Run locally to see full error details
composer phpstan
```

**ESLint Issues:**
```bash
# Auto-fix most issues
npm run lint:fix
```

**Flutter Analysis:**
```bash
# Fix formatting
dart format lib test

# See detailed analysis
flutter analyze
```

---

## Adding New Dependencies

### PHP/Composer:
```bash
composer require package-name
git add composer.json composer.lock
git commit -m "Add package-name dependency"
```

### NPM:
```bash
npm install package-name
git add package.json package-lock.json
git commit -m "Add package-name dependency"
```

### Flutter:
```bash
cd frontend
flutter pub add package_name
git add pubspec.yaml pubspec.lock
git commit -m "Add package_name dependency"
```

---

## Maintenance

### Updating Workflow Actions:
Workflows use the latest versions (v4, v2, etc.). Check for updates:
- [actions/checkout](https://github.com/actions/checkout)
- [actions/cache](https://github.com/actions/cache)
- [shivammathur/setup-php](https://github.com/shivammathur/setup-php)
- [actions/setup-node](https://github.com/actions/setup-node)
- [subosito/flutter-action](https://github.com/subosito/flutter-action)

### Monitoring:
- Check Actions tab regularly for failures
- Set up notifications: Settings → Notifications → Actions
- Review failed runs and fix issues promptly

---

## Troubleshooting

### Workflow not running?
- Check path filters - did you modify relevant files?
- Verify branch name matches trigger (main/develop)
- Check if workflows are enabled in repository settings

### Cache issues?
- Caches update when lock files change
- Manually clear cache: Actions → Caches → Delete specific cache
- Cache key includes OS and lock file hash

### Build failures?
- Check workflow logs in Actions tab
- Look for red ✗ marks to find failing step
- Review error messages and stack traces
- Run commands locally to reproduce

---

## Production Deployment

**IMPORTANT:** These workflows are designed for **testing only**, not production deployment.

To add production deployment:
1. Create separate workflow files (e.g., `deploy-production.yml`)
2. Add deployment jobs that run ONLY on specific tags or branches
3. Use GitHub Environments for deployment protection rules
4. Add necessary deployment secrets (SSH keys, API tokens, etc.)
5. Consider manual approval steps for production

Example production trigger:
```yaml
on:
  push:
    tags:
      - 'v*.*.*'
```

---

## Support

For issues with:
- **GitHub Actions**: Check [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Laravel Testing**: [Laravel Testing Docs](https://laravel.com/docs/testing)
- **Flutter CI**: [Flutter CI/CD Docs](https://docs.flutter.dev/deployment/cd)
- **ESLint**: [ESLint Documentation](https://eslint.org/docs/latest/)

---

**Last Updated:** 2025-11-20
**Workflows Version:** 1.0.0
