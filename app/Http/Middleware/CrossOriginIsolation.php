<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enable Cross-Origin Isolation for SharedArrayBuffer support.
 * Required for FFmpeg.wasm video compression in browser.
 */
class CrossOriginIsolation
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // These headers enable SharedArrayBuffer in browsers
        // Required for FFmpeg.wasm video compression
        // Using 'credentialless' to allow CDN resources without CORS
        $response->headers->set('Cross-Origin-Embedder-Policy', 'credentialless');
        $response->headers->set('Cross-Origin-Opener-Policy', 'same-origin');

        return $response;
    }
}
