<?php

namespace App\Modules\Search\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Videos\Models\Video;
use App\Modules\Shop\Models\Product;
use Illuminate\Support\Facades\DB;

class SearchService
{
    /**
     * Global search across all content types
     */
    public function globalSearch(string $query, ?string $type = null, int $limit = 20)
    {
        $results = [
            'businesses' => [],
            'videos' => [],
            'products' => []
        ];

        if (!$type || $type === 'businesses') {
            $results['businesses'] = $this->searchBusinesses($query, $limit);
        }

        if (!$type || $type === 'videos') {
            $results['videos'] = $this->searchVideos($query, $limit);
        }

        if (!$type || $type === 'products') {
            $results['products'] = $this->searchProducts($query, $limit);
        }

        return $results;
    }

    /**
     * Search businesses with full-text search
     */
    public function searchBusinesses(string $query, int $limit = 20, array $filters = [])
    {
        $searchQuery = Business::query()
            ->where('status', 'active')
            ->where(function($q) use ($query) {
                $q->where('business_name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('address', 'LIKE', "%{$query}%");
            });

        // Apply filters
        if (isset($filters['business_type'])) {
            $searchQuery->where('business_type', $filters['business_type']);
        }

        if (isset($filters['min_rating'])) {
            $searchQuery->where('average_rating', '>=', $filters['min_rating']);
        }

        if (isset($filters['latitude']) && isset($filters['longitude']) && isset($filters['radius'])) {
            // Distance calculation in kilometers
            $lat = $filters['latitude'];
            $lng = $filters['longitude'];
            $radius = $filters['radius']; // in km

            $searchQuery->whereRaw(
                "( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) *
                cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) *
                sin( radians( latitude ) ) ) ) <= ?",
                [$lat, $lng, $lat, $radius]
            );
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'relevance';
        switch ($sortBy) {
            case 'rating':
                $searchQuery->orderByDesc('average_rating');
                break;
            case 'reviews':
                $searchQuery->orderByDesc('total_reviews');
                break;
            case 'views':
                $searchQuery->orderByDesc('view_count');
                break;
            default:
                $searchQuery->orderByDesc('is_verified')
                           ->orderByDesc('average_rating');
        }

        return $searchQuery->limit($limit)->get();
    }

    /**
     * Search videos
     */
    public function searchVideos(string $query, int $limit = 20, array $filters = [])
    {
        $searchQuery = Video::query()
            ->where('status', 'published')
            ->where('is_published', true)
            ->where(function($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhereHas('hashtags', function($hashQuery) use ($query) {
                      $hashQuery->where('hashtag', 'LIKE', "%{$query}%");
                  });
            })
            ->with(['business', 'hashtags']);

        // Apply filters
        if (isset($filters['business_type'])) {
            $searchQuery->whereHas('business', function($q) use ($filters) {
                $q->where('business_type', $filters['business_type']);
            });
        }

        if (isset($filters['min_views'])) {
            $searchQuery->where('view_count', '>=', $filters['min_views']);
        }

        if (isset($filters['min_duration']) || isset($filters['max_duration'])) {
            if (isset($filters['min_duration'])) {
                $searchQuery->where('duration', '>=', $filters['min_duration']);
            }
            if (isset($filters['max_duration'])) {
                $searchQuery->where('duration', '<=', $filters['max_duration']);
            }
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'relevance';
        switch ($sortBy) {
            case 'views':
                $searchQuery->orderByDesc('view_count');
                break;
            case 'likes':
                $searchQuery->orderByDesc('like_count');
                break;
            case 'recent':
                $searchQuery->orderByDesc('created_at');
                break;
            default:
                $searchQuery->orderByDesc('like_count')
                           ->orderByDesc('view_count');
        }

        return $searchQuery->limit($limit)->get();
    }

    /**
     * Search products
     */
    public function searchProducts(string $query, int $limit = 20, array $filters = [])
    {
        $searchQuery = Product::query()
            ->where('is_available', true)
            ->where(function($q) use ($query) {
                $q->where('name', 'LIKE', "%{$query}%")
                  ->orWhere('description', 'LIKE', "%{$query}%")
                  ->orWhere('sku', 'LIKE', "%{$query}%");
            })
            ->with(['business', 'images', 'category']);

        // Apply filters
        if (isset($filters['category_id'])) {
            $searchQuery->where('category_id', $filters['category_id']);
        }

        if (isset($filters['min_price'])) {
            $searchQuery->where('price', '>=', $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $searchQuery->where('price', '<=', $filters['max_price']);
        }

        if (isset($filters['in_stock']) && $filters['in_stock']) {
            $searchQuery->where('stock_quantity', '>', 0);
        }

        if (isset($filters['min_rating'])) {
            $searchQuery->where('rating', '>=', $filters['min_rating']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'relevance';
        switch ($sortBy) {
            case 'price_asc':
                $searchQuery->orderBy('price');
                break;
            case 'price_desc':
                $searchQuery->orderByDesc('price');
                break;
            case 'rating':
                $searchQuery->orderByDesc('rating');
                break;
            case 'popular':
                $searchQuery->orderByDesc('view_count');
                break;
            case 'newest':
                $searchQuery->orderByDesc('created_at');
                break;
            default:
                $searchQuery->orderByDesc('rating')
                           ->orderByDesc('view_count');
        }

        return $searchQuery->limit($limit)->get();
    }

    /**
     * Search by hashtag
     */
    public function searchByHashtag(string $hashtag, int $limit = 20)
    {
        return Video::query()
            ->where('status', 'published')
            ->where('is_published', true)
            ->whereHas('hashtags', function($q) use ($hashtag) {
                $q->where('hashtag', $hashtag);
            })
            ->with(['business', 'hashtags'])
            ->orderByDesc('like_count')
            ->orderByDesc('view_count')
            ->limit($limit)
            ->get();
    }

    /**
     * Get autocomplete suggestions
     */
    public function autocomplete(string $query, int $limit = 10)
    {
        $suggestions = [];

        // Business names
        $businesses = Business::where('business_name', 'LIKE', "%{$query}%")
            ->where('status', 'active')
            ->select('business_name as suggestion', DB::raw("'business' as type"))
            ->limit($limit)
            ->get();

        // Product names
        $products = Product::where('name', 'LIKE', "%{$query}%")
            ->where('is_available', true)
            ->select('name as suggestion', DB::raw("'product' as type"))
            ->limit($limit)
            ->get();

        // Hashtags
        $hashtags = DB::table('video_hashtags')
            ->where('hashtag', 'LIKE', "%{$query}%")
            ->select('hashtag as suggestion', DB::raw("'hashtag' as type"))
            ->distinct()
            ->limit($limit)
            ->get();

        return [
            'businesses' => $businesses,
            'products' => $products,
            'hashtags' => $hashtags
        ];
    }

    /**
     * Get trending searches (placeholder for future implementation)
     */
    public function getTrendingSearches(int $limit = 10)
    {
        // In a real implementation, this would track search queries
        // For now, return popular hashtags
        return DB::table('video_hashtags')
            ->select('hashtag', DB::raw('COUNT(*) as count'))
            ->groupBy('hashtag')
            ->orderByDesc('count')
            ->limit($limit)
            ->get();
    }
}
