<?php

use App\Modules\Search\Controllers\SearchController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Search Module API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1/search')->group(function () {

    // Global search (all content types)
    Route::get('/', [SearchController::class, 'globalSearch']);

    // Search by content type
    Route::get('/businesses', [SearchController::class, 'searchBusinesses']);
    Route::get('/videos', [SearchController::class, 'searchVideos']);
    Route::get('/products', [SearchController::class, 'searchProducts']);

    // Search by hashtag
    Route::get('/hashtag/{hashtag}', [SearchController::class, 'searchByHashtag']);

    // Autocomplete and trending
    Route::get('/autocomplete', [SearchController::class, 'autocomplete']);
    Route::get('/trending', [SearchController::class, 'trending']);
});
