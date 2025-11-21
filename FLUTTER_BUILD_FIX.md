# Flutter Build Hanging Fix (Updated for Flutter 3.35)

## Problem
The Flutter Android build was hanging indefinitely during the Gradle build phase in CI/CD, specifically when downloading Android SDK components during the build process. Additionally, outdated Android SDK configurations were incompatible with Flutter 3.35 requirements.

## Flutter 3.35 Requirements (November 2025)
Flutter 3.35 requires these specific versions in CI:

- ✅ **Java 17** (not Java 11)
- ✅ **Android SDK Command-line Tools 12.0+** (not older versions)
- ✅ **Android API Level 34/35** (not API 33)
- ✅ **Build Tools 34.0.0+** (not 33.0.0)
- ✅ **Gradle 8.x** (AGP 8.9.1)
- ✅ **NDK 27.0.12077973**

**❌ DO NOT USE:** `android-actions/setup-android@v3` - it installs outdated components (Java 11, old command-line tools, API < 33)

## Root Causes
1. **SDK Downloads During Build** - NDK and SDK Platform downloading mid-build (takes 5+ minutes)
2. **Outdated Android SDK Action** - `android-actions/setup-android@v3` incompatible with Flutter 3.35
3. **Wrong API Levels** - Using API 33 instead of API 34/35
4. **Wrong Java Version** - Using Java 11 instead of Java 17 in build.gradle
5. **Gradle Daemon** - Running in CI causes hangs and memory issues  
6. **Excessive Memory** - 8GB allocation too high for CI runners
7. **No Timeouts** - Build could hang forever
8. **No SDK Caching** - Re-downloading SDK components on every build

## Changes Made

### 1. Gradle Properties (`frontend/android/gradle.properties`)
```properties
# Optimized for CI
org.gradle.jvmargs=-Xmx4G -XX:MaxMetaspaceSize=1G
org.gradle.daemon=false              # Disable daemon in CI
org.gradle.parallel=true             # Enable parallel builds
org.gradle.caching=true              # Enable build cache
android.builder.sdkDownload=true     # Auto-download SDK components
```

### 2. Android Build Configuration (`frontend/android/app/build.gradle.kts`)
```kotlin
// UPDATED: Java 17 required for Flutter 3.35 + AGP 8.x
compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17  // Was VERSION_11
    targetCompatibility = JavaVersion.VERSION_17  // Was VERSION_11
}

kotlinOptions {
    jvmTarget = JavaVersion.VERSION_17.toString()  // Was VERSION_11
}
```

### 3. AGP Version (`frontend/android/settings.gradle.kts`)
```kotlin
plugins {
    id("com.android.application") version "8.9.1" apply false  // AGP 8.x
    id("org.jetbrains.kotlin.android") version "2.1.0" apply false
}
```

### 4. CI Workflow (`ci.yml` and `flutter.yml`)

#### ❌ REMOVED: Outdated Android Setup Action
```yaml
# REMOVED - Incompatible with Flutter 3.35
# - name: Setup Android SDK
#   uses: android-actions/setup-android@v3
```

#### ✅ ADDED: Proper Flutter 3.35 Setup
```yaml
- name: Setup Java 17 (Required for Flutter 3.35)
  uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '17'              # Java 17 required
    cache: 'gradle'

- name: Setup Flutter 3.35
  uses: subosito/flutter-action@v2
  with:
    flutter-version: '3.35.7'       # Updated from 3.24.0
    channel: stable
    cache: true

- name: Install Android SDK Components (API 34/35 for Flutter 3.35)
  run: |
    flutter doctor -v
    
    # Update SDK manager to latest version
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --update || true
    
    # Install required components for Flutter 3.35
    $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install \
      "cmdline-tools;latest" \
      "platform-tools" \
      "platforms;android-34" \      # API 34 (was 33)
      "platforms;android-35" \      # API 35 (new)
      "build-tools;34.0.0" \        # Build Tools 34 (was 33)
      "build-tools;35.0.0" \        # Build Tools 35 (new)
      "ndk;27.0.12077973" || true
    
    # Accept all licenses
    yes | $ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --licenses || true
    
    # Verify installation
    flutter doctor -v
```

#### Added Timeouts
```yaml
timeout-minutes: 15  # Job-level timeout
timeout-minutes: 10  # Build step timeout
```

#### Added Gradle Caching
```yaml
- name: Cache Gradle wrapper
  uses: actions/cache@v4
  with:
    path: |
      ~/.gradle/wrapper
      ~/.gradle/caches
      frontend/android/.gradle
    key: gradle-${{ runner.os }}-${{ hashFiles('frontend/android/gradle/wrapper/gradle-wrapper.properties') }}
```

#### Verbose Build Output
```yaml
- name: Build Android APK
  run: flutter build apk --debug --verbose
```

### 5. Gradle Init Script (`frontend/android/init.gradle.kts`)
Created optimization script that:
- Configures max workers based on CPU cores
- Enables build cache
- Forces HTTPS for repositories

## Expected Results

### Before (Flutter 3.24, API 33, Java 11)
- Build hangs at "Running Gradle task 'assembleDebug'..."
- "SDK not found" errors
- "Build tools 34.0.0 missing" errors
- "AGP requires Java 17" errors
- NDK and Platform downloading mid-build (~5-9 minutes)
- Total time: 9+ minutes (often timeout/hang)

### After (Flutter 3.35, API 34/35, Java 17)
- SDK components pre-installed (~1-2 minutes)
- No SDK compatibility errors
- Build completes in 3-5 minutes
- Gradle dependencies cached
- Subsequent builds: 2-3 minutes
- Clear timeout if something goes wrong (15min max)

## Testing Locally

Test the build locally with CI-compatible settings:

```bash
cd frontend

# Verify Flutter version
flutter --version  # Should be 3.35.7

# Pre-install SDK components
flutter doctor -v
$ANDROID_HOME/cmdline-tools/latest/bin/sdkmanager --install \
  "platforms;android-34" \
  "platforms;android-35" \
  "build-tools;34.0.0" \
  "build-tools;35.0.0" \
  "ndk;27.0.12077973"

# Build with verbose output
flutter build apk --debug --verbose
```

## Monitoring Build Progress

Look for these milestones:

1. ✅ "Setup Java 17" (~5s)
2. ✅ "Setup Flutter 3.35" (~10s with cache)
3. ✅ "Install Android SDK Components" (~1-2min first time, ~5s cached)
4. ✅ "Running Gradle task 'assembleDebug'..." 
5. ✅ "BUILD SUCCESSFUL" (~2-3min)
6. ✅ "Built build/app/outputs/flutter-apk/app-debug.apk"

**Total expected time**: 
- First run: 5-7 minutes
- Cached runs: 2-3 minutes

## Common Errors & Solutions

### Error: "Unsupported Android commandline tools version"
**Solution:** ✅ Fixed - We now update to latest commandline-tools

### Error: "SDK not found" or "Build tools 34.0.0 missing"
**Solution:** ✅ Fixed - We pre-install API 34/35 and build-tools 34/35

### Error: "AGP requires Java 17"
**Solution:** ✅ Fixed - Updated build.gradle.kts to Java 17

### Error: Build still hangs
**Solutions:**
1. Check workflow logs for SDK installation errors
2. Reduce memory: `-Xmx2G` in gradle.properties
3. Clean build:
   ```yaml
   - run: flutter clean
   - run: cd android && ./gradlew clean
   ```

## Version Compatibility Matrix

| Flutter | AGP | Java | API Level | Build Tools | Gradle |
|---------|-----|------|-----------|-------------|--------|
| 3.35.x  | 8.9+ | 17  | 34/35     | 34.0.0+     | 8.x    |
| 3.24.x  | 8.5+ | 17  | 33/34     | 33.0.0+     | 8.x    |
| 3.16.x  | 8.1+ | 17  | 33        | 33.0.0      | 8.x    |
