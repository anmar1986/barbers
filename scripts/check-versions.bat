@echo off
REM Dependency Version Checker for CI/CD (Windows/XAMPP)
REM This script verifies that your local environment matches CI/CD requirements

echo ================================================================
echo      CI/CD Dependency Version Checker (Windows/XAMPP)
echo ================================================================
echo.

SET ERRORS=0
SET WARNINGS=0

echo [92mChecking Backend (Laravel) Dependencies...[0m
echo ================================================================

REM Check PHP
php -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2" %%i in ('php -v ^| findstr /r "^PHP"') do set PHP_VERSION=%%i
    echo [92m[+][0m PHP: %PHP_VERSION%
) else (
    echo [91m[X][0m PHP: Not found
    SET /A ERRORS+=1
)

REM Check Composer
composer --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=3" %%i in ('composer --version') do set COMPOSER_VERSION=%%i
    echo [92m[+][0m Composer: %COMPOSER_VERSION%
) else (
    echo [91m[X][0m Composer: Not found
    SET /A ERRORS+=1
)

REM Check PHP Extensions
echo.
echo [92mChecking PHP Extensions...[0m
php -m | findstr "gd" >nul 2>&1 && echo [92m[+][0m gd extension enabled || (echo [91m[X][0m gd extension missing & SET /A ERRORS+=1)
php -m | findstr "mbstring" >nul 2>&1 && echo [92m[+][0m mbstring extension enabled || (echo [91m[X][0m mbstring extension missing & SET /A ERRORS+=1)
php -m | findstr "zip" >nul 2>&1 && echo [92m[+][0m zip extension enabled || (echo [91m[X][0m zip extension missing & SET /A ERRORS+=1)
php -m | findstr "intl" >nul 2>&1 && echo [92m[+][0m intl extension enabled || (echo [91m[X][0m intl extension missing & SET /A ERRORS+=1)
php -m | findstr "pdo_mysql" >nul 2>&1 && echo [92m[+][0m pdo_mysql extension enabled || (echo [91m[X][0m pdo_mysql extension missing & SET /A ERRORS+=1)
php -m | findstr "bcmath" >nul 2>&1 && echo [92m[+][0m bcmath extension enabled || (echo [91m[X][0m bcmath extension missing & SET /A ERRORS+=1)
php -m | findstr "exif" >nul 2>&1 && echo [92m[+][0m exif extension enabled || (echo [91m[X][0m exif extension missing & SET /A ERRORS+=1)

echo.
echo [92mChecking Mobile (Flutter) Dependencies...[0m
echo ================================================================

REM Check Flutter
flutter --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=2" %%i in ('flutter --version ^| findstr "Flutter"') do set FLUTTER_VERSION=%%i
    echo [92m[+][0m Flutter: %FLUTTER_VERSION%
) else (
    echo [91m[X][0m Flutter: Not found
    SET /A ERRORS+=1
)

REM Check Dart
dart --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [92m[+][0m Dart SDK: Installed
) else (
    echo [91m[X][0m Dart SDK: Not found
    SET /A ERRORS+=1
)

echo.
echo [92mChecking Web (React) Dependencies...[0m
echo ================================================================

REM Check Node.js
node -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f %%i in ('node -v') do set NODE_VERSION=%%i
    echo [92m[+][0m Node.js: %NODE_VERSION%
) else (
    echo [91m[X][0m Node.js: Not found
    SET /A ERRORS+=1
)

REM Check npm
npm -v >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f %%i in ('npm -v') do set NPM_VERSION=%%i
    echo [92m[+][0m npm: %NPM_VERSION%
) else (
    echo [91m[X][0m npm: Not found
    SET /A ERRORS+=1
)

echo.
echo [92mChecking Database (XAMPP)...[0m
echo ================================================================

REM Check if MySQL is accessible
mysql --version >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=5" %%i in ('mysql --version') do set MYSQL_VERSION=%%i
    echo [92m[+][0m MySQL: %MYSQL_VERSION%
) else (
    echo [93m[!][0m MySQL: Command not found (Check XAMPP Control Panel)
    SET /A WARNINGS+=1
)

echo.
echo [92mChecking Lock Files...[0m
echo ================================================================

if exist "composer.lock" (
    echo [92m[+][0m composer.lock exists
) else (
    echo [91m[X][0m composer.lock missing (Run: composer install)
    SET /A ERRORS+=1
)

if exist "package-lock.json" (
    echo [92m[+][0m package-lock.json exists
) else (
    echo [91m[X][0m package-lock.json missing (Run: npm install)
    SET /A ERRORS+=1
)

if exist "frontend\pubspec.lock" (
    echo [92m[+][0m frontend\pubspec.lock exists
) else (
    echo [91m[X][0m frontend\pubspec.lock missing (Run: cd frontend ^&^& flutter pub get)
    SET /A ERRORS+=1
)

echo.
echo ================================================================
echo                          Summary
echo ================================================================

if %ERRORS% EQU 0 (
    if %WARNINGS% EQU 0 (
        echo [92mStatus: All checks passed![0m
        echo Your environment is ready for CI/CD
    ) else (
        echo [93mStatus: Passed with warnings[0m
        echo Warnings: %WARNINGS%
        echo Your environment should work, but check warnings
    )
) else (
    echo [91mStatus: Failed[0m
    echo Errors: %ERRORS%   Warnings: %WARNINGS%
    echo Please fix errors before pushing to CI/CD
    echo.
    echo Recommended Actions:
    echo   1. Install missing dependencies
    echo   2. Update version mismatches
    echo   3. Run this script again to verify
    echo   4. Check .github\workflows\README.md for details
)

echo ================================================================
echo.

if %ERRORS% GTR 0 (
    exit /b 1
) else (
    echo [92mYou're ready to push! All systems go![0m
    exit /b 0
)
