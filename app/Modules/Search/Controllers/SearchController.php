<?php

namespace App\Modules\Search\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Search\Services\SearchService;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    protected SearchService $searchService;

    public function __construct(SearchService $searchService)
    {
        $this->searchService = $searchService;
    }

    /**
     * Global search across all content types
     * GET /api/v1/search?q=keyword&type=businesses&limit=20
     */
    public function globalSearch(Request $request)
    {
        $query = $request->input('q', '');
        $type = $request->input('type'); // businesses, videos, products, or null for all
        $limit = $request->input('limit', 20);

        if (empty($query)) {
            return response()->json([
                'success' => false,
                'message' => 'Search query is required',
            ], 400);
        }

        $results = $this->searchService->globalSearch($query, $type, $limit);

        return response()->json([
            'success' => true,
            'query' => $query,
            'results' => $results,
        ]);
    }

    /**
     * Search businesses with advanced filters
     * GET /api/v1/search/businesses?q=keyword&business_type=barber&min_rating=4&sort_by=rating
     */
    public function searchBusinesses(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 20);

        $filters = [
            'business_type' => $request->input('business_type'),
            'min_rating' => $request->input('min_rating'),
            'latitude' => $request->input('lat'),
            'longitude' => $request->input('lng'),
            'radius' => $request->input('radius'), // in km
            'sort_by' => $request->input('sort_by', 'relevance'),
        ];

        $results = $this->searchService->searchBusinesses($query, $limit, $filters);

        return response()->json([
            'success' => true,
            'query' => $query,
            'filters' => $filters,
            'count' => $results->count(),
            'data' => $results,
        ]);
    }

    /**
     * Search videos
     * GET /api/v1/search/videos?q=keyword&business_type=barber&min_views=1000&sort_by=views
     */
    public function searchVideos(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 20);

        $filters = [
            'business_type' => $request->input('business_type'),
            'min_views' => $request->input('min_views'),
            'min_duration' => $request->input('min_duration'),
            'max_duration' => $request->input('max_duration'),
            'sort_by' => $request->input('sort_by', 'relevance'),
        ];

        $results = $this->searchService->searchVideos($query, $limit, $filters);

        return response()->json([
            'success' => true,
            'query' => $query,
            'filters' => $filters,
            'count' => $results->count(),
            'data' => $results,
        ]);
    }

    /**
     * Search products
     * GET /api/v1/search/products?q=keyword&category_id=1&min_price=10&max_price=100&sort_by=price_asc
     */
    public function searchProducts(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 20);

        $filters = [
            'category_id' => $request->input('category_id'),
            'min_price' => $request->input('min_price'),
            'max_price' => $request->input('max_price'),
            'in_stock' => $request->input('in_stock'),
            'min_rating' => $request->input('min_rating'),
            'sort_by' => $request->input('sort_by', 'relevance'),
        ];

        $results = $this->searchService->searchProducts($query, $limit, $filters);

        return response()->json([
            'success' => true,
            'query' => $query,
            'filters' => $filters,
            'count' => $results->count(),
            'data' => $results,
        ]);
    }

    /**
     * Search by hashtag
     * GET /api/v1/search/hashtag/{hashtag}
     */
    public function searchByHashtag(string $hashtag, Request $request)
    {
        $limit = $request->input('limit', 20);
        $results = $this->searchService->searchByHashtag($hashtag, $limit);

        return response()->json([
            'success' => true,
            'hashtag' => $hashtag,
            'count' => $results->count(),
            'data' => $results,
        ]);
    }

    /**
     * Get autocomplete suggestions
     * GET /api/v1/search/autocomplete?q=keyword
     */
    public function autocomplete(Request $request)
    {
        $query = $request->input('q', '');
        $limit = $request->input('limit', 10);

        if (strlen($query) < 2) {
            return response()->json([
                'success' => false,
                'message' => 'Query must be at least 2 characters',
            ], 400);
        }

        $suggestions = $this->searchService->autocomplete($query, $limit);

        return response()->json([
            'success' => true,
            'query' => $query,
            'suggestions' => $suggestions,
        ]);
    }

    /**
     * Get trending searches
     * GET /api/v1/search/trending
     */
    public function trending(Request $request)
    {
        $limit = $request->input('limit', 10);
        $trending = $this->searchService->getTrendingSearches($limit);

        return response()->json([
            'success' => true,
            'data' => $trending,
        ]);
    }
}
