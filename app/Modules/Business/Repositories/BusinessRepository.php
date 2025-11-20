<?php

namespace App\Modules\Business\Repositories;

use App\Modules\Business\Models\Business;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class BusinessRepository
{
    /**
     * Get all businesses with filters and pagination.
     */
    public function getAll(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = Business::query()
            ->with(['user:id,first_name,last_name,profile_picture', 'services'])
            ->where('is_active', true);

        // Filter by business type
        if (! empty($filters['business_type'])) {
            $query->where('business_type', $filters['business_type']);
        }

        // Filter by city
        if (! empty($filters['city'])) {
            $query->where('city', $filters['city']);
        }

        // Search by name or description
        if (! empty($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('business_name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('description', 'like', '%'.$filters['search'].'%');
            });
        }

        // Filter by verified status
        if (isset($filters['verified'])) {
            $query->where('is_verified', (bool) $filters['verified']);
        }

        // Filter by rating
        if (! empty($filters['min_rating'])) {
            $query->where('rating', '>=', $filters['min_rating']);
        }

        // Order by
        $orderBy = $filters['order_by'] ?? 'created_at';
        $orderDirection = $filters['order_direction'] ?? 'desc';

        // Validate order by column
        $allowedColumns = ['created_at', 'rating', 'review_count', 'follower_count', 'business_name'];
        if (in_array($orderBy, $allowedColumns)) {
            $query->orderBy($orderBy, $orderDirection);
        }

        return $query->paginate($perPage);
    }

    /**
     * Get business by UUID with all relations.
     */
    public function findByUuid(string $uuid): ?Business
    {
        return Business::with([
            'user:id,first_name,last_name,profile_picture,email',
            'hours',
            'services' => function ($query) {
                $query->where('is_available', true)
                    ->orderBy('name');
            },
            'reviews' => function ($query) {
                $query->with('user:id,first_name,last_name,profile_picture')
                    ->orderBy('created_at', 'desc')
                    ->limit(10);
            },
        ])->where('uuid', $uuid)->first();
    }

    /**
     * Get businesses by type.
     */
    public function getByType(string $type, int $perPage = 15): LengthAwarePaginator
    {
        return Business::query()
            ->with(['user:id,first_name,last_name,profile_picture'])
            ->where('business_type', $type)
            ->where('is_active', true)
            ->orderBy('rating', 'desc')
            ->paginate($perPage);
    }

    /**
     * Get nearby businesses.
     */
    public function getNearby(float $latitude, float $longitude, float $radiusKm = 10, int $limit = 20): Collection
    {
        // Using Haversine formula
        $query = Business::query()
            ->select('*')
            ->selectRaw(
                '( 6371 * acos( cos( radians(?) ) * cos( radians( latitude ) ) * cos( radians( longitude ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitude ) ) ) ) AS distance',
                [$latitude, $longitude, $latitude]
            )
            ->where('is_active', true)
            ->whereNotNull('latitude')
            ->whereNotNull('longitude')
            ->having('distance', '<', $radiusKm)
            ->orderBy('distance')
            ->limit($limit);

        return $query->get();
    }

    /**
     * Get featured/verified businesses.
     */
    public function getFeatured(int $limit = 10): Collection
    {
        return Business::query()
            ->with(['user:id,first_name,last_name,profile_picture'])
            ->where('is_verified', true)
            ->where('is_active', true)
            ->where('rating', '>=', 4.5)
            ->orderBy('follower_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get trending businesses.
     */
    public function getTrending(int $limit = 10): Collection
    {
        return Business::query()
            ->with(['user:id,first_name,last_name,profile_picture'])
            ->where('is_active', true)
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('view_count', 'desc')
            ->orderBy('follower_count', 'desc')
            ->limit($limit)
            ->get();
    }

    /**
     * Get businesses by user ID.
     */
    public function getByUserId(int $userId): Collection
    {
        return Business::query()
            ->with(['services', 'hours'])
            ->where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Increment view count.
     */
    public function incrementViews(Business $business): void
    {
        $business->increment('view_count');
    }
}
