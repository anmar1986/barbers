<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupFakeData extends Command
{
    protected $signature = 'data:cleanup-fake {--force : Skip confirmation}';

    protected $description = 'Remove all seeded/fake data while keeping real user data';

    // Fake user IDs (seeded data)
    private array $fakeUserIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];

    // Fake business IDs (seeded data)
    private array $fakeBusinessIds = [1, 2, 3, 4, 5, 6, 7, 8];

    public function handle(): int
    {
        $this->info('=== Fake Data Cleanup ===');
        $this->newLine();

        // Show what will be deleted
        $this->warn('This will delete:');
        $this->line('  - '.count($this->fakeUserIds).' fake users (IDs: 1-19)');
        $this->line('  - '.count($this->fakeBusinessIds).' fake businesses (IDs: 1-8)');
        $this->line('  - All videos from fake businesses');
        $this->line('  - All services, reviews, follows, hours, media from fake businesses');
        $this->line('  - All products from fake businesses');
        $this->line('  - All orders from fake users');
        $this->line('  - All notifications, favorites, comments, likes from fake users');
        $this->newLine();

        // Count what will be deleted
        $counts = $this->countFakeData();
        $this->table(
            ['Table', 'Records to Delete'],
            collect($counts)->map(fn ($count, $table) => [$table, $count])->toArray()
        );

        if (! $this->option('force') && ! $this->confirm('Do you want to proceed with deletion?')) {
            $this->info('Operation cancelled.');

            return 0;
        }

        $this->info('Starting cleanup...');

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            // Delete in order to respect foreign keys

            // 1. Notifications
            $deleted = DB::table('notifications')
                ->whereIn('user_id', $this->fakeUserIds)
                ->delete();
            $this->line("  Deleted {$deleted} notifications");

            // 2. Favorites
            $deleted = DB::table('favorites')
                ->whereIn('user_id', $this->fakeUserIds)
                ->delete();
            $this->line("  Deleted {$deleted} favorites");

            // 3. Order Items (from fake business products or fake user orders)
            $fakeOrderIds = DB::table('orders')
                ->whereIn('user_id', $this->fakeUserIds)
                ->pluck('id');
            $deleted = DB::table('order_items')
                ->where(function ($q) use ($fakeOrderIds) {
                    $q->whereIn('order_id', $fakeOrderIds)
                        ->orWhereIn('business_id', $this->fakeBusinessIds);
                })
                ->delete();
            $this->line("  Deleted {$deleted} order items");

            // 4. Orders
            $deleted = DB::table('orders')
                ->whereIn('user_id', $this->fakeUserIds)
                ->delete();
            $this->line("  Deleted {$deleted} orders");

            // 5. Product Images
            $fakeProductIds = DB::table('products')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->pluck('id');
            $deleted = DB::table('product_images')
                ->whereIn('product_id', $fakeProductIds)
                ->delete();
            $this->line("  Deleted {$deleted} product images");

            // 6. Products
            $deleted = DB::table('products')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} products");

            // 7. Video Comments
            $fakeVideoIds = DB::table('videos')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->pluck('id');
            $deleted = DB::table('video_comments')
                ->where(function ($q) use ($fakeVideoIds) {
                    $q->whereIn('video_id', $fakeVideoIds)
                        ->orWhereIn('user_id', $this->fakeUserIds);
                })
                ->delete();
            $this->line("  Deleted {$deleted} video comments");

            // 8. Video Likes
            $deleted = DB::table('video_likes')
                ->where(function ($q) use ($fakeVideoIds) {
                    $q->whereIn('video_id', $fakeVideoIds)
                        ->orWhereIn('user_id', $this->fakeUserIds);
                })
                ->delete();
            $this->line("  Deleted {$deleted} video likes");

            // 9. Video Hashtags
            $deleted = DB::table('video_hashtags')
                ->whereIn('video_id', $fakeVideoIds)
                ->delete();
            $this->line("  Deleted {$deleted} video hashtags");

            // 10. Videos
            $deleted = DB::table('videos')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} videos");

            // 11. Reviews
            $deleted = DB::table('reviews')
                ->where(function ($q) {
                    $q->whereIn('business_id', $this->fakeBusinessIds)
                        ->orWhereIn('user_id', $this->fakeUserIds);
                })
                ->delete();
            $this->line("  Deleted {$deleted} reviews");

            // 12. Follows
            $deleted = DB::table('follows')
                ->where(function ($q) {
                    $q->whereIn('business_id', $this->fakeBusinessIds)
                        ->orWhereIn('follower_id', $this->fakeUserIds);
                })
                ->delete();
            $this->line("  Deleted {$deleted} follows");

            // 13. Media Gallery
            $deleted = DB::table('media_gallery')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} media gallery items");

            // 14. Services
            $deleted = DB::table('services')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} services");

            // 15. Business Hours
            $deleted = DB::table('business_hours')
                ->whereIn('business_id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} business hours");

            // 16. Businesses
            $deleted = DB::table('businesses')
                ->whereIn('id', $this->fakeBusinessIds)
                ->delete();
            $this->line("  Deleted {$deleted} businesses");

            // 17. Users
            $deleted = DB::table('users')
                ->whereIn('id', $this->fakeUserIds)
                ->delete();
            $this->line("  Deleted {$deleted} users");

            DB::statement('SET FOREIGN_KEY_CHECKS=1;');

            $this->newLine();
            $this->info('Cleanup completed successfully!');

            // Show remaining data
            $this->newLine();
            $this->info('Remaining data:');
            $this->line('  Users: '.DB::table('users')->count());
            $this->line('  Businesses: '.DB::table('businesses')->count());
            $this->line('  Videos: '.DB::table('videos')->count());
            $this->line('  Products: '.DB::table('products')->count());

        } catch (\Exception $e) {
            DB::statement('SET FOREIGN_KEY_CHECKS=1;');
            $this->error('Error during cleanup: '.$e->getMessage());

            return 1;
        }

        return 0;
    }

    private function countFakeData(): array
    {
        $fakeVideoIds = DB::table('videos')
            ->whereIn('business_id', $this->fakeBusinessIds)
            ->pluck('id');

        $fakeProductIds = DB::table('products')
            ->whereIn('business_id', $this->fakeBusinessIds)
            ->pluck('id');

        $fakeOrderIds = DB::table('orders')
            ->whereIn('user_id', $this->fakeUserIds)
            ->pluck('id');

        return [
            'users' => DB::table('users')->whereIn('id', $this->fakeUserIds)->count(),
            'businesses' => DB::table('businesses')->whereIn('id', $this->fakeBusinessIds)->count(),
            'videos' => $fakeVideoIds->count(),
            'video_hashtags' => DB::table('video_hashtags')->whereIn('video_id', $fakeVideoIds)->count(),
            'video_comments' => DB::table('video_comments')->whereIn('video_id', $fakeVideoIds)->count(),
            'video_likes' => DB::table('video_likes')->whereIn('video_id', $fakeVideoIds)->count(),
            'services' => DB::table('services')->whereIn('business_id', $this->fakeBusinessIds)->count(),
            'business_hours' => DB::table('business_hours')->whereIn('business_id', $this->fakeBusinessIds)->count(),
            'media_gallery' => DB::table('media_gallery')->whereIn('business_id', $this->fakeBusinessIds)->count(),
            'reviews' => DB::table('reviews')->whereIn('business_id', $this->fakeBusinessIds)->count(),
            'follows' => DB::table('follows')->whereIn('business_id', $this->fakeBusinessIds)->count(),
            'products' => $fakeProductIds->count(),
            'product_images' => DB::table('product_images')->whereIn('product_id', $fakeProductIds)->count(),
            'orders' => $fakeOrderIds->count(),
            'order_items' => DB::table('order_items')->whereIn('order_id', $fakeOrderIds)->count(),
            'favorites' => DB::table('favorites')->whereIn('user_id', $this->fakeUserIds)->count(),
            'notifications' => DB::table('notifications')->whereIn('user_id', $this->fakeUserIds)->count(),
        ];
    }
}
