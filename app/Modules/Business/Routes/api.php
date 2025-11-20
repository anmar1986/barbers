<?php

use App\Modules\Business\Controllers\BusinessController;
use App\Modules\Business\Controllers\BusinessManagementController;
use App\Modules\Business\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::get('/businesses', [BusinessController::class, 'index']);
Route::get('/businesses/{uuid}', [BusinessController::class, 'show']);
Route::get('/businesses/{uuid}/reviews', [BusinessController::class, 'reviews']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // File upload routes
    Route::post('/upload/image', [UploadController::class, 'uploadImage']);
    Route::post('/upload/images', [UploadController::class, 'uploadMultipleImages']);
    Route::post('/upload/video', [UploadController::class, 'uploadVideo']);
    Route::delete('/upload/file', [UploadController::class, 'deleteFile']);
    
    // Business owner management routes
    Route::prefix('my-business')->group(function () {
        Route::get('/', [BusinessManagementController::class, 'getMyBusiness']);
        Route::put('/', [BusinessManagementController::class, 'updateBusiness']);
        Route::delete('/', [BusinessManagementController::class, 'deleteBusiness']);
        Route::get('/statistics', [BusinessManagementController::class, 'getStatistics']);

        // Services management
        Route::get('/services', [BusinessManagementController::class, 'getServices']);
        Route::post('/services', [BusinessManagementController::class, 'createService']);
        Route::put('/services/{uuid}', [BusinessManagementController::class, 'updateService']);
        Route::delete('/services/{uuid}', [BusinessManagementController::class, 'deleteService']);

        // Business hours
        Route::get('/hours', [BusinessManagementController::class, 'getBusinessHours']);
        Route::put('/hours', [BusinessManagementController::class, 'updateBusinessHours']);

        // Business videos
        Route::get('/videos', [BusinessManagementController::class, 'getVideos']);
    });

    // Business management (legacy routes - to be deprecated)
    Route::post('/businesses', [BusinessController::class, 'store']);
    Route::put('/businesses/{uuid}', [BusinessController::class, 'update']);
    Route::delete('/businesses/{uuid}', [BusinessController::class, 'destroy']);

    // Business hours
    Route::put('/businesses/{uuid}/hours', [BusinessController::class, 'updateHours']);

    // Services
    Route::post('/businesses/{uuid}/services', [BusinessController::class, 'addService']);
    Route::put('/businesses/{uuid}/services/{serviceId}', [BusinessController::class, 'updateService']);
    Route::delete('/businesses/{uuid}/services/{serviceId}', [BusinessController::class, 'deleteService']);

    // Reviews
    Route::post('/businesses/{uuid}/reviews', [BusinessController::class, 'addReview']);

    // Follow/Unfollow
    Route::post('/businesses/{uuid}/follow', [BusinessController::class, 'follow']);
    Route::post('/businesses/{uuid}/unfollow', [BusinessController::class, 'unfollow']);
});
