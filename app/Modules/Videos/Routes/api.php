<?php

use App\Modules\Videos\Controllers\VideoController;
use Illuminate\Support\Facades\Route;

// Public routes (with optional authentication for user-specific data like is_liked)
Route::middleware('optional.auth')->group(function () {
    Route::get('/videos/feed', [VideoController::class, 'feed']);
    Route::get('/videos/trending', [VideoController::class, 'trending']);
    Route::get('/videos/search', [VideoController::class, 'search']);
    Route::get('/videos/{uuid}', [VideoController::class, 'show']);
    Route::get('/videos/{uuid}/comments', [VideoController::class, 'comments']);
    Route::get('/businesses/{businessUuid}/videos', [VideoController::class, 'businessVideos']);
});

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    // Video management
    Route::post('/videos', [VideoController::class, 'store']);
    Route::put('/videos/{uuid}', [VideoController::class, 'update']);
    Route::delete('/videos/{uuid}', [VideoController::class, 'destroy']);

    // Like/Unlike
    Route::post('/videos/{uuid}/like', [VideoController::class, 'like']);
    Route::post('/videos/{uuid}/unlike', [VideoController::class, 'unlike']);

    // Comments
    Route::post('/videos/{uuid}/comments', [VideoController::class, 'addComment']);
    Route::delete('/videos/{uuid}/comments/{commentId}', [VideoController::class, 'deleteComment']);

    // Share
    Route::post('/videos/{uuid}/share', [VideoController::class, 'share']);
});
