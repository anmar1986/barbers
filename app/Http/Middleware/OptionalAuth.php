<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class OptionalAuth
{
    /**
     * Handle an incoming request.
     *
     * This middleware attempts to authenticate the user via Sanctum,
     * but doesn't fail if no valid token is provided.
     * This allows routes to work for both authenticated and guest users.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Try to authenticate via sanctum token
        if ($token = $request->bearerToken()) {
            try {
                $accessToken = PersonalAccessToken::findToken($token);
                if ($accessToken && $accessToken->tokenable) {
                    // Set the authenticated user for this request
                    $request->setUserResolver(function () use ($accessToken) {
                        return $accessToken->tokenable;
                    });
                }
            } catch (\Exception $e) {
                // If authentication fails, continue as guest
            }
        }

        return $next($request);
    }
}
