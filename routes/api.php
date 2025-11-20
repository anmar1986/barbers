<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
| Module routes are automatically loaded from app/Modules/*
|    /Routes/api.php
| via the ModuleServiceProvider.
|
*/

// Global API routes (if needed)
// Module-specific routes are in their respective module folders

// Admin Routes (protected by auth middleware)
Route::middleware(['auth:sanctum'])->prefix('admin')->group(function () {
    // Statistics
    Route::get('/stats/users', [\App\Http\Controllers\Api\AdminController::class, 'getUsersStats']);
    Route::get('/stats/businesses', [\App\Http\Controllers\Api\AdminController::class, 'getBusinessesStats']);
    Route::get('/stats/videos', [\App\Http\Controllers\Api\AdminController::class, 'getVideosStats']);
    Route::get('/stats/products', [\App\Http\Controllers\Api\AdminController::class, 'getProductsStats']);

    // List endpoints
    Route::get('/users', [\App\Http\Controllers\Api\AdminController::class, 'getUsers']);
    Route::get('/businesses', [\App\Http\Controllers\Api\AdminController::class, 'getBusinesses']);
    Route::get('/videos', [\App\Http\Controllers\Api\AdminController::class, 'getVideos']);
    Route::get('/products', [\App\Http\Controllers\Api\AdminController::class, 'getProducts']);

    // Business management
    Route::put('/businesses/{uuid}/status', [\App\Http\Controllers\Api\AdminController::class, 'toggleBusinessStatus']);
    Route::put('/businesses/{uuid}/verify', [\App\Http\Controllers\Api\AdminController::class, 'toggleBusinessVerification']);

    // Video management
    Route::delete('/videos/{uuid}', [\App\Http\Controllers\Api\AdminController::class, 'deleteVideo']);

    // Product management
    Route::delete('/products/{uuid}', [\App\Http\Controllers\Api\AdminController::class, 'deleteProduct']);

    // Admin Analytics
    Route::get('/analytics/platform', [\App\Http\Controllers\Api\AnalyticsController::class, 'getPlatformAnalytics']);
    Route::get('/analytics/realtime', [\App\Http\Controllers\Api\AnalyticsController::class, 'getRealTimeAnalytics']);
});

// Analytics Routes (protected by auth middleware)
Route::middleware(['auth:sanctum'])->prefix('analytics')->group(function () {
    Route::post('/track', [\App\Http\Controllers\Api\AnalyticsController::class, 'trackEvent']);
    Route::get('/business', [\App\Http\Controllers\Api\AnalyticsController::class, 'getBusinessAnalytics']);
    Route::get('/user-behavior', [\App\Http\Controllers\Api\AnalyticsController::class, 'getUserBehavior']);
    Route::get('/export', [\App\Http\Controllers\Api\AnalyticsController::class, 'exportReport']);
});
