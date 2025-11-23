<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Enable SharedArrayBuffer for FFmpeg.wasm video compression
        $middleware->web(append: [
            \App\Http\Middleware\CrossOriginIsolation::class,
        ]);

        $middleware->alias([
            'optional.auth' => \App\Http\Middleware\OptionalAuth::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })
    ->withProviders([
        \App\Providers\ModuleServiceProvider::class,
    ])
    ->create();
