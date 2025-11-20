#!/bin/bash

# Dependency Version Checker for CI/CD
# This script verifies that your local environment matches CI/CD requirements

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     CI/CD Dependency Version Checker                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check version
check_version() {
    local name=$1
    local current=$2
    local required=$3
    local status=$4
    
    if [ "$status" == "OK" ]; then
        echo -e "${GREEN}✓${NC} $name: $current (Required: $required)"
    elif [ "$status" == "WARNING" ]; then
        echo -e "${YELLOW}⚠${NC} $name: $current (Recommended: $required)"
        ((WARNINGS++))
    else
        echo -e "${RED}✗${NC} $name: Not found or version mismatch (Required: $required)"
        ((ERRORS++))
    fi
}

echo "📋 Checking Backend (Laravel) Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -v | head -n 1 | cut -d " " -f 2 | cut -d "." -f 1,2)
    if [[ "$PHP_VERSION" == "8.2" ]] || [[ "$PHP_VERSION" == "8.3" ]]; then
        check_version "PHP" "$PHP_VERSION" "8.2 or 8.3" "OK"
    else
        check_version "PHP" "$PHP_VERSION" "8.2 or 8.3" "ERROR"
    fi
else
    check_version "PHP" "Not installed" "8.2 or 8.3" "ERROR"
fi

# Check Composer
if command -v composer &> /dev/null; then
    COMPOSER_VERSION=$(composer --version | cut -d " " -f 3 | cut -d "." -f 1)
    if [[ "$COMPOSER_VERSION" == "2" ]]; then
        check_version "Composer" "2.x" "2.x" "OK"
    else
        check_version "Composer" "$COMPOSER_VERSION" "2.x" "WARNING"
    fi
else
    check_version "Composer" "Not installed" "2.x" "ERROR"
fi

# Check PHP Extensions
echo ""
echo "📦 Checking PHP Extensions..."
REQUIRED_EXTENSIONS=("gd" "mbstring" "zip" "intl" "pdo_mysql" "bcmath" "exif")
for ext in "${REQUIRED_EXTENSIONS[@]}"; do
    if php -m | grep -q "^$ext$"; then
        echo -e "${GREEN}✓${NC} $ext extension enabled"
    else
        echo -e "${RED}✗${NC} $ext extension missing"
        ((ERRORS++))
    fi
done

echo ""
echo "📱 Checking Mobile (Flutter) Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Flutter
if command -v flutter &> /dev/null; then
    FLUTTER_VERSION=$(flutter --version | head -n 1 | cut -d " " -f 2)
    if [[ "$FLUTTER_VERSION" == "3.27.1" ]]; then
        check_version "Flutter" "$FLUTTER_VERSION" "3.27.1" "OK"
    else
        check_version "Flutter" "$FLUTTER_VERSION" "3.27.1" "WARNING"
    fi
    
    # Check Flutter channel
    FLUTTER_CHANNEL=$(flutter channel | grep "*" | cut -d " " -f 2)
    if [[ "$FLUTTER_CHANNEL" == "stable" ]]; then
        echo -e "${GREEN}✓${NC} Flutter Channel: stable"
    else
        echo -e "${YELLOW}⚠${NC} Flutter Channel: $FLUTTER_CHANNEL (Recommended: stable)"
        ((WARNINGS++))
    fi
else
    check_version "Flutter" "Not installed" "3.27.1" "ERROR"
fi

# Check Dart
if command -v dart &> /dev/null; then
    DART_VERSION=$(dart --version 2>&1 | cut -d " " -f 4 | cut -d "." -f 1)
    if [[ "$DART_VERSION" == "3" ]]; then
        check_version "Dart SDK" "3.x" "3.0+" "OK"
    else
        check_version "Dart SDK" "$DART_VERSION" "3.0+" "ERROR"
    fi
else
    check_version "Dart SDK" "Not installed" "3.0+" "ERROR"
fi

echo ""
echo "🌐 Checking Web (React) Dependencies..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d "v" -f 2 | cut -d "." -f 1)
    if [[ "$NODE_VERSION" == "20" ]]; then
        check_version "Node.js" "20.x" "20.x" "OK"
    else
        check_version "Node.js" "$NODE_VERSION" "20.x" "WARNING"
    fi
else
    check_version "Node.js" "Not installed" "20.x" "ERROR"
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v | cut -d "." -f 1)
    check_version "npm" "$NPM_VERSION.x" "10.x" "OK"
else
    check_version "npm" "Not installed" "10.x" "ERROR"
fi

echo ""
echo "🗄️ Checking Database..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check MySQL
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version | cut -d " " -f 6 | cut -d "." -f 1)
    if [[ "$MYSQL_VERSION" == "8" ]]; then
        check_version "MySQL" "8.x" "8.0" "OK"
    else
        check_version "MySQL" "$MYSQL_VERSION" "8.0" "WARNING"
    fi
else
    echo -e "${YELLOW}⚠${NC} MySQL command not found (May be running in XAMPP)"
fi

echo ""
echo "📦 Checking Lock Files..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -f "composer.lock" ]; then
    echo -e "${GREEN}✓${NC} composer.lock exists"
else
    echo -e "${RED}✗${NC} composer.lock missing (Run: composer install)"
    ((ERRORS++))
fi

if [ -f "package-lock.json" ]; then
    echo -e "${GREEN}✓${NC} package-lock.json exists"
else
    echo -e "${RED}✗${NC} package-lock.json missing (Run: npm install)"
    ((ERRORS++))
fi

if [ -f "frontend/pubspec.lock" ]; then
    echo -e "${GREEN}✓${NC} frontend/pubspec.lock exists"
else
    echo -e "${RED}✗${NC} frontend/pubspec.lock missing (Run: cd frontend && flutter pub get)"
    ((ERRORS++))
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                         Summary                            ║"
echo "╠════════════════════════════════════════════════════════════╣"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "║  ${GREEN}Status: All checks passed! ✓${NC}                           ║"
    echo "║  Your environment is ready for CI/CD                   ║"
elif [ $ERRORS -eq 0 ]; then
    echo -e "║  ${YELLOW}Status: Passed with warnings ⚠${NC}                        ║"
    echo -e "║  Warnings: $WARNINGS                                            ║"
    echo "║  Your environment should work, but check warnings      ║"
else
    echo -e "║  ${RED}Status: Failed ✗${NC}                                       ║"
    echo -e "║  Errors: $ERRORS   Warnings: $WARNINGS                                ║"
    echo "║  Please fix errors before pushing to CI/CD             ║"
fi

echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $ERRORS -gt 0 ]; then
    echo "🔧 Recommended Actions:"
    echo "  1. Install missing dependencies"
    echo "  2. Update version mismatches"
    echo "  3. Run this script again to verify"
    echo "  4. Check .github/workflows/README.md for details"
    exit 1
elif [ $WARNINGS -gt 0 ]; then
    echo "💡 Recommendations:"
    echo "  - Consider updating to recommended versions"
    echo "  - Review warnings above"
    echo "  - CI/CD should still work"
    exit 0
else
    echo "🚀 You're ready to push! All systems go!"
    exit 0
fi
