<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\BusinessHours;
use App\Modules\Business\Models\Review;
use App\Modules\Business\Models\Service;
use App\Modules\Business\Repositories\BusinessRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class BusinessService
{
    public function __construct(
        private BusinessRepository $businessRepository
    ) {}

    /**
     * Get all businesses with filters.
     */
    public function getAllBusinesses(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->businessRepository->getAll($filters, $perPage);
    }

    /**
     * Get business by UUID.
     */
    public function getBusinessByUuid(string $uuid): ?Business
    {
        $business = $this->businessRepository->findByUuid($uuid);

        if (! $business) {
            return null;
        }

        // Increment view count
        $this->businessRepository->incrementViews($business);

        return $business;
    }

    /**
     * Get businesses by type.
     */
    public function getBusinessesByType(string $type, int $perPage = 15): LengthAwarePaginator
    {
        return $this->businessRepository->getByType($type, $perPage);
    }

    /**
     * Get nearby businesses.
     */
    public function getNearbyBusinesses(float $lat, float $lng, float $radius = 10): Collection
    {
        return $this->businessRepository->getNearby($lat, $lng, $radius);
    }

    /**
     * Get featured businesses.
     */
    public function getFeaturedBusinesses(int $limit = 10): Collection
    {
        return $this->businessRepository->getFeatured($limit);
    }

    /**
     * Get trending businesses.
     */
    public function getTrendingBusinesses(int $limit = 10): Collection
    {
        return $this->businessRepository->getTrending($limit);
    }

    /**
     * Create a new business.
     */
    public function createBusiness(int $userId, array $data): Business
    {
        return DB::transaction(function () use ($userId, $data) {
            $business = Business::create([
                'user_id' => $userId,
                'business_name' => $data['business_name'],
                'business_type' => $data['business_type'],
                'description' => $data['description'] ?? null,
                'phone' => $data['phone'] ?? null,
                'email' => $data['email'] ?? null,
                'website' => $data['website'] ?? null,
                'address' => $data['address'] ?? null,
                'city' => $data['city'] ?? null,
                'state' => $data['state'] ?? null,
                'zip_code' => $data['zip_code'] ?? null,
                'country' => $data['country'] ?? 'USA',
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
                'logo' => $data['logo'] ?? null,
                'cover_image' => $data['cover_image'] ?? null,
            ]);

            // Create business hours if provided
            if (isset($data['hours']) && is_array($data['hours'])) {
                foreach ($data['hours'] as $hour) {
                    BusinessHours::create([
                        'business_id' => $business->id,
                        'day_of_week' => $hour['day_of_week'],
                        'open_time' => $hour['open_time'],
                        'close_time' => $hour['close_time'],
                        'is_closed' => $hour['is_closed'] ?? false,
                    ]);
                }
            }

            // Create services if provided
            if (isset($data['services']) && is_array($data['services'])) {
                foreach ($data['services'] as $service) {
                    Service::create([
                        'business_id' => $business->id,
                        'name' => $service['name'],
                        'description' => $service['description'] ?? null,
                        'price' => $service['price'],
                        'duration_minutes' => $service['duration_minutes'] ?? null,
                        'is_available' => $service['is_available'] ?? true,
                    ]);
                }
            }

            return $business->load(['hours', 'services']);
        });
    }

    /**
     * Update business information.
     */
    public function updateBusiness(Business $business, array $data): Business
    {
        $business->update([
            'business_name' => $data['business_name'] ?? $business->business_name,
            'business_type' => $data['business_type'] ?? $business->business_type,
            'description' => $data['description'] ?? $business->description,
            'phone' => $data['phone'] ?? $business->phone,
            'email' => $data['email'] ?? $business->email,
            'website' => $data['website'] ?? $business->website,
            'address' => $data['address'] ?? $business->address,
            'city' => $data['city'] ?? $business->city,
            'state' => $data['state'] ?? $business->state,
            'zip_code' => $data['zip_code'] ?? $business->zip_code,
            'country' => $data['country'] ?? $business->country,
            'latitude' => $data['latitude'] ?? $business->latitude,
            'longitude' => $data['longitude'] ?? $business->longitude,
            'logo' => $data['logo'] ?? $business->logo,
            'cover_image' => $data['cover_image'] ?? $business->cover_image,
        ]);

        return $business->fresh();
    }

    /**
     * Delete business (soft delete).
     */
    public function deleteBusiness(Business $business): bool
    {
        return $business->delete();
    }

    /**
     * Add or update business hours.
     */
    public function updateBusinessHours(Business $business, array $hours): Collection
    {
        return DB::transaction(function () use ($business, $hours) {
            // Delete existing hours
            $business->hours()->delete();

            // Create new hours
            foreach ($hours as $hour) {
                BusinessHours::create([
                    'business_id' => $business->id,
                    'day_of_week' => $hour['day_of_week'],
                    'open_time' => $hour['open_time'],
                    'close_time' => $hour['close_time'],
                    'is_closed' => $hour['is_closed'] ?? false,
                ]);
            }

            return $business->hours()->get();
        });
    }

    /**
     * Add a service to business.
     */
    public function addService(Business $business, array $data): Service
    {
        return Service::create([
            'business_id' => $business->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'duration_minutes' => $data['duration_minutes'] ?? null,
            'is_available' => $data['is_available'] ?? true,
        ]);
    }

    /**
     * Update a service.
     */
    public function updateService(Service $service, array $data): Service
    {
        $service->update([
            'name' => $data['name'] ?? $service->name,
            'description' => $data['description'] ?? $service->description,
            'price' => $data['price'] ?? $service->price,
            'duration_minutes' => $data['duration_minutes'] ?? $service->duration_minutes,
            'is_available' => $data['is_available'] ?? $service->is_available,
        ]);

        return $service->fresh();
    }

    /**
     * Delete a service.
     */
    public function deleteService(Service $service): bool
    {
        return $service->delete();
    }

    /**
     * Add a review to business.
     */
    public function addReview(Business $business, int $userId, array $data): Review
    {
        return Review::create([
            'business_id' => $business->id,
            'user_id' => $userId,
            'rating' => $data['rating'],
            'review_text' => $data['review_text'] ?? null,
        ]);
    }

    /**
     * Get business reviews.
     */
    public function getBusinessReviews(Business $business): Collection
    {
        return $business->reviews()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Follow a business.
     */
    public function followBusiness(Business $business, int $userId): void
    {
        DB::table('follows')->insert([
            'follower_id' => $userId,
            'business_id' => $business->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $business->increment('follower_count');
    }

    /**
     * Unfollow a business.
     */
    public function unfollowBusiness(Business $business, int $userId): void
    {
        DB::table('follows')
            ->where('follower_id', $userId)
            ->where('business_id', $business->id)
            ->delete();

        $business->decrement('follower_count');
    }

    /**
     * Check if user is following a business.
     */
    public function isFollowing(Business $business, int $userId): bool
    {
        return DB::table('follows')
            ->where('follower_id', $userId)
            ->where('business_id', $business->id)
            ->exists();
    }
}
