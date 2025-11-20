<?php

namespace App\Providers;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;

class ModuleServiceProvider extends ServiceProvider
{
    /**
     * List of modules to load
     */
    protected array $modules = [
        'Auth',
        'Business',
        'Videos',
        'Shop',
        'User',
        'Search',
        'Payment',
        'Notification',
    ];

    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        $this->registerModuleRoutes();
    }

    /**
     * Register routes from each module
     */
    protected function registerModuleRoutes(): void
    {
        // Modules without version prefix (Business, Videos, Auth, etc.)
        $modulesWithoutVersion = ['Business', 'Videos', 'Auth', 'User', 'Search', 'Payment', 'Notification'];

        foreach ($modulesWithoutVersion as $module) {
            $routePath = app_path("Modules/{$module}/Routes/api.php");

            if (File::exists($routePath)) {
                Route::middleware('api')
                    ->prefix('api')
                    ->group($routePath);
            }
        }

        // Shop module uses v1 prefix
        $shopRoutePath = app_path('Modules/Shop/Routes/api.php');
        if (File::exists($shopRoutePath)) {
            Route::middleware('api')
                ->prefix('api')
                ->group($shopRoutePath);
        }
    }
}
