<?php

namespace App\Services;

use App\Modules\Videos\Models\Video;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Track an analytics event
     */
    public function trackEvent(
        string $eventType,
        ?int $userId = null,
        ?string $category = null,
        ?string $label = null,
        ?int $value = null,
        array $metadata = []
    ): void {
        DB::table('analytics_events')->insert([
            'user_id' => $userId,
            'event_type' => $eventType,
            'event_category' => $category,
            'event_label' => $label,
            'event_value' => $value,
            'metadata' => json_encode($metadata),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'referrer' => request()->header('referer'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Get business analytics for a date range
     */
    public function getBusinessAnalytics(int $businessId, string $startDate, string $endDate): array
    {
        $summary = DB::table('analytics_daily_summary')
            ->where('entity_type', 'business')
            ->where('entity_id', $businessId)
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                SUM(page_views) as total_views,
                SUM(unique_visitors) as total_visitors,
                SUM(actions) as total_actions,
                SUM(revenue) as total_revenue,
                AVG(page_views) as avg_daily_views
            ')
            ->first();

        $dailyData = DB::table('analytics_daily_summary')
            ->where('entity_type', 'business')
            ->where('entity_id', $businessId)
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // Get video analytics for this business
        $videoStats = DB::table('videos')
            ->where('business_id', $businessId)
            ->selectRaw('
                COUNT(*) as total_videos,
                SUM(view_count) as total_video_views,
                SUM(like_count) as total_likes,
                SUM(comment_count) as total_comments
            ')
            ->first();

        // Get product analytics
        $productStats = DB::table('products')
            ->where('business_id', $businessId)
            ->selectRaw('
                COUNT(*) as total_products,
                SUM(view_count) as total_product_views
            ')
            ->first();

        // Get top performing videos
        $topVideos = DB::table('videos')
            ->where('business_id', $businessId)
            ->orderBy('view_count', 'desc')
            ->limit(5)
            ->select('uuid', 'title', 'view_count', 'like_count', 'comment_count')
            ->get();

        // Get top performing products
        $topProducts = DB::table('products')
            ->where('business_id', $businessId)
            ->orderBy('view_count', 'desc')
            ->limit(5)
            ->select('uuid', 'name', 'view_count', 'price')
            ->get();

        return [
            'summary' => $summary,
            'daily_data' => $dailyData,
            'video_stats' => $videoStats,
            'product_stats' => $productStats,
            'top_videos' => $topVideos,
            'top_products' => $topProducts,
        ];
    }

    /**
     * Get platform-wide analytics (for admin)
     */
    public function getPlatformAnalytics(string $startDate, string $endDate): array
    {
        // Overall stats
        $overallStats = [
            'total_users' => DB::table('users')->count(),
            'total_businesses' => DB::table('businesses')->count(),
            'total_videos' => DB::table('videos')->count(),
            'total_products' => DB::table('products')->count(),
            'active_users' => DB::table('users')->where('is_active', true)->count(),
        ];

        // Daily growth
        $dailyGrowth = DB::table('analytics_daily_summary')
            ->where('entity_type', 'platform')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date')
            ->get();

        // Top businesses by views
        $topBusinesses = DB::table('businesses')
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->select('uuid', 'business_name', 'view_count', 'category')
            ->get();

        // Top videos
        $topVideos = Video::with('business')
            ->orderBy('view_count', 'desc')
            ->limit(10)
            ->select('uuid', 'title', 'view_count', 'like_count', 'business_id')
            ->get();

        // Revenue stats
        $revenueStats = DB::table('analytics_daily_summary')
            ->whereBetween('date', [$startDate, $endDate])
            ->selectRaw('
                SUM(revenue) as total_revenue,
                AVG(revenue) as avg_daily_revenue
            ')
            ->first();

        // User growth over time
        $userGrowth = DB::table('users')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'overall_stats' => $overallStats,
            'daily_growth' => $dailyGrowth,
            'top_businesses' => $topBusinesses,
            'top_videos' => $topVideos,
            'revenue_stats' => $revenueStats,
            'user_growth' => $userGrowth,
        ];
    }

    /**
     * Update daily summary for an entity
     */
    public function updateDailySummary(
        string $entityType,
        ?int $entityId,
        ?string $date = null,
        int $pageViews = 0,
        int $uniqueVisitors = 0,
        int $actions = 0,
        float $revenue = 0
    ): void {
        $date = $date ?? now()->format('Y-m-d');

        DB::table('analytics_daily_summary')->updateOrInsert(
            [
                'date' => $date,
                'entity_type' => $entityType,
                'entity_id' => $entityId,
            ],
            [
                'page_views' => DB::raw("page_views + {$pageViews}"),
                'unique_visitors' => DB::raw("unique_visitors + {$uniqueVisitors}"),
                'actions' => DB::raw("actions + {$actions}"),
                'revenue' => DB::raw("revenue + {$revenue}"),
                'updated_at' => now(),
            ]
        );
    }

    /**
     * Get event statistics
     */
    public function getEventStats(string $eventType, string $startDate, string $endDate): array
    {
        return DB::table('analytics_events')
            ->where('event_type', $eventType)
            ->whereBetween('created_at', [$startDate, $endDate])
            ->selectRaw('
                COUNT(*) as total_events,
                COUNT(DISTINCT user_id) as unique_users,
                DATE(created_at) as date
            ')
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->toArray();
    }

    /**
     * Get user behavior analytics
     */
    public function getUserBehavior(int $userId, int $days = 30): array
    {
        $startDate = now()->subDays($days)->startOfDay();

        $events = DB::table('analytics_events')
            ->where('user_id', $userId)
            ->where('created_at', '>=', $startDate)
            ->selectRaw('
                event_type,
                event_category,
                COUNT(*) as count
            ')
            ->groupBy('event_type', 'event_category')
            ->get();

        return [
            'total_events' => $events->sum('count'),
            'events_by_type' => $events,
        ];
    }

    /**
     * Get real-time analytics (last hour)
     */
    public function getRealTimeAnalytics(): array
    {
        $oneHourAgo = now()->subHour();

        return [
            'active_users' => DB::table('analytics_events')
                ->where('created_at', '>=', $oneHourAgo)
                ->distinct('user_id')
                ->count('user_id'),
            'page_views' => DB::table('analytics_events')
                ->where('event_type', 'page_view')
                ->where('created_at', '>=', $oneHourAgo)
                ->count(),
            'recent_events' => DB::table('analytics_events')
                ->where('created_at', '>=', $oneHourAgo)
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get(),
        ];
    }
}
