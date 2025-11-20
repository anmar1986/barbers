<?php

use App\Modules\Shop\Controllers\CartController;
use App\Modules\Shop\Controllers\OrderController;
use App\Modules\Shop\Controllers\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Shop Module API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {

    // ===========================
    // PRODUCT ROUTES
    // ===========================

    // Public product routes
    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{uuid}', [ProductController::class, 'show']);
    Route::get('/products/category/{slug}', [ProductController::class, 'byCategory']);

    // Protected product routes (business only)
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{uuid}', [ProductController::class, 'update']);
        Route::delete('/products/{uuid}', [ProductController::class, 'destroy']);
        Route::put('/products/{uuid}/stock', [ProductController::class, 'updateStock']);
    });

    // ===========================
    // CART ROUTES
    // ===========================

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/items', [CartController::class, 'addItem']);
        Route::put('/cart/items/{cartItemId}', [CartController::class, 'updateItem']);
        Route::delete('/cart/items/{cartItemId}', [CartController::class, 'removeItem']);
        Route::delete('/cart/clear', [CartController::class, 'clear']);
        Route::post('/cart/calculate', [CartController::class, 'calculateTotals']);
    });

    // ===========================
    // ORDER ROUTES
    // ===========================

    Route::middleware('auth:sanctum')->group(function () {
        // Customer order routes
        Route::get('/orders', [OrderController::class, 'index']);
        Route::get('/orders/{orderNumber}', [OrderController::class, 'show']);
        Route::post('/checkout', [OrderController::class, 'checkout']);
        Route::post('/orders/{orderNumber}/cancel', [OrderController::class, 'cancel']);
        Route::put('/orders/{orderNumber}/status', [OrderController::class, 'updateStatus']);

        // Business order routes
        Route::get('/business/orders', [OrderController::class, 'businessOrders']);
        Route::get('/business/orders/stats', [OrderController::class, 'businessOrderStats']);
    });
});
