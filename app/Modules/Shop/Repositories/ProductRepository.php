<?php

namespace App\Modules\Shop\Repositories;

use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductCategory;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProductRepository
{
    /**
     * Get all products with filters and pagination.
     */
    public function getAll(array $filters = [], int $perPage = 20): LengthAwarePaginator
    {
        $query = Product::query()
            ->with([
                'business:id,uuid,business_name,slug',
                'category:id,name,slug',
                'images' => function ($q) {
                    $q->orderBy('display_order');
                }
            ]);

        // Filter by business
        if (!empty($filters['business_id'])) {
            $query->where('business_id', $filters['business_id']);
        }

        // Filter by category
        if (!empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filter by category slug
        if (!empty($filters['category_slug'])) {
            $category = ProductCategory::where('slug', $filters['category_slug'])->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // Filter by price range
        if (!empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (!empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // Filter by stock availability
        if (isset($filters['in_stock']) && $filters['in_stock']) {
            $query->where('stock_quantity', '>', 0);
        }

        // Search by name or description
        if (!empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        
        $allowedSorts = ['created_at', 'price', 'rating', 'view_count', 'name'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($perPage);
    }

    /**
     * Find product by UUID.
     */
    public function findByUuid(string $uuid): ?Product
    {
        return Product::with([
            'business:id,uuid,business_name,slug,is_verified',
            'category:id,name,slug',
            'images' => function ($q) {
                $q->orderBy('display_order');
            }
        ])->where('uuid', $uuid)->first();
    }

    /**
     * Get products by business.
     */
    public function getByBusiness(int $businessId, int $perPage = 20): LengthAwarePaginator
    {
        return Product::with([
            'category:id,name,slug',
            'images' => function ($q) {
                $q->where('is_primary', true)->limit(1);
            }
        ])
        ->where('business_id', $businessId)
        ->orderBy('created_at', 'desc')
        ->paginate($perPage);
    }

    /**
     * Get featured products.
     */
    public function getFeatured(int $limit = 10): Collection
    {
        return Product::with([
            'business:id,uuid,business_name,slug',
            'images' => function ($q) {
                $q->where('is_primary', true)->limit(1);
            }
        ])
        ->where('stock_quantity', '>', 0)
        ->where('rating', '>=', 4.0)
        ->orderBy('view_count', 'desc')
        ->limit($limit)
        ->get();
    }

    /**
     * Get best selling products.
     */
    public function getBestSelling(int $limit = 10): Collection
    {
        return Product::with([
            'business:id,uuid,business_name,slug',
            'images' => function ($q) {
                $q->where('is_primary', true)->limit(1);
            }
        ])
        ->where('stock_quantity', '>', 0)
        ->orderBy('sales_count', 'desc')
        ->limit($limit)
        ->get();
    }

    /**
     * Get new arrivals.
     */
    public function getNewArrivals(int $limit = 10): Collection
    {
        return Product::with([
            'business:id,uuid,business_name,slug',
            'images' => function ($q) {
                $q->where('is_primary', true)->limit(1);
            }
        ])
        ->where('stock_quantity', '>', 0)
        ->where('created_at', '>=', now()->subDays(30))
        ->orderBy('created_at', 'desc')
        ->limit($limit)
        ->get();
    }

    /**
     * Get all categories.
     */
    public function getAllCategories(): Collection
    {
        return ProductCategory::orderBy('display_order')->get();
    }

    /**
     * Increment view count.
     */
    public function incrementViews(Product $product): void
    {
        $product->increment('view_count');
    }

    /**
     * Update stock quantity.
     */
    public function updateStock(Product $product, int $quantity): Product
    {
        $product->update(['stock_quantity' => $quantity]);
        return $product->fresh();
    }
}
