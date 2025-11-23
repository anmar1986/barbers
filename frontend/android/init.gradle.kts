// Gradle init script for CI optimization
// This file is automatically loaded by Gradle

gradle.startParameter.apply {
    // Disable interactive mode
    isConsoleOutput = false
    
    // Set max workers based on available CPU
    maxWorkerCount = Runtime.getRuntime().availableProcessors()
    
    // Enable build cache
    isBuildCacheEnabled = true
}

// Suppress warnings in CI
gradle.beforeProject {
    // Reduce log spam
    project.logger.lifecycle("Configuring ${project.name}")
}

allprojects {
    repositories {
        // Force use of HTTPS
        all {
            if (this is MavenArtifactRepository) {
                val originalUrl = url.toString()
                if (originalUrl.startsWith("http://")) {
                    val httpsUrl = originalUrl.replace("http://", "https://")
                    try {
                        setUrl(httpsUrl)
                        logger.lifecycle("Replaced HTTP with HTTPS: $httpsUrl")
                    } catch (e: Exception) {
                        logger.warn("Failed to replace HTTP with HTTPS for $originalUrl")
                    }
                }
            }
        }
    }
    
    // Timeout for dependency resolution
    configurations.all {
        resolutionStrategy {
            cacheDynamicVersionsFor(0, "seconds")
            cacheChangingModulesFor(0, "seconds")
        }
    }
}
