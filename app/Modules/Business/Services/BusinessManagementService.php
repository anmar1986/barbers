<?php

namespace App\Modules\Business\Services;

use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Service;
use App\Modules\Business\Models\BusinessHour;
use Illuminate\Support\Facades\DB;

class BusinessManagementService
{
    /**
     * Get business owned by the user
     */
    public function getOwnerBusiness(int $userId): ?Business
    {
        return Business::with(['services', 'hours', 'user'])
            ->where('user_id', $userId)
            ->first();
    }

    /**
     * Update business details
     */
    public function updateBusiness(int $userId, array $data): Business
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        $business->update($data);

        return $business->fresh(['services', 'hours']);
    }

    /**
     * Get business statistics
     */
    public function getBusinessStatistics(int $userId): array
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        return [
            'total_followers' => $business->followers()->count(),
            'total_reviews' => $business->reviews()->count(),
            'average_rating' => $business->average_rating ?? 0,
            'total_services' => $business->services()->count(),
            'active_services' => $business->services()->where('is_available', true)->count(),
            'total_bookings' => 0, // Appointments feature not implemented yet
            'pending_bookings' => 0, // Appointments feature not implemented yet
            'total_videos' => $business->videos()->count(),
            'total_video_views' => $business->videos()->sum('view_count'),
        ];
    }

    /**
     * Get all services for the business
     */
    public function getServices(int $userId): array
    {
        $business = Business::where('user_id', $userId)->firstOrFail();
        
        return $business->services()
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();
    }

    /**
     * Create a new service
     */
    public function createService(int $userId, array $data): Service
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        $service = new Service($data);
        $service->business_id = $business->id;
        $service->is_active = $data['is_active'] ?? true;
        $service->save();

        return $service;
    }

    /**
     * Update a service
     */
    public function updateService(int $userId, string $serviceUuid, array $data): Service
    {
        \Log::info('BusinessManagementService::updateService called', [
            'user_id' => $userId,
            'service_uuid' => $serviceUuid,
            'data' => $data
        ]);

        $business = Business::where('user_id', $userId)->firstOrFail();

        \Log::info('Business found:', [
            'business_id' => $business->id,
            'business_name' => $business->business_name
        ]);

        $service = Service::where('business_id', $business->id)
            ->where('uuid', $serviceUuid)
            ->firstOrFail();

        \Log::info('Service found before update:', $service->toArray());

        $service->update($data);

        \Log::info('Service after update:', $service->toArray());

        return $service->fresh();
    }

    /**
     * Delete a service
     */
    public function deleteService(int $userId, string $serviceUuid): bool
    {
        $business = Business::where('user_id', $userId)->firstOrFail();
        
        $service = Service::where('business_id', $business->id)
            ->where('uuid', $serviceUuid)
            ->firstOrFail();

        return $service->delete();
    }

    /**
     * Get business hours
     */
    public function getBusinessHours(int $userId): array
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        return $business->hours()
            ->orderBy('day_of_week')
            ->get()
            ->toArray();
    }

    /**
     * Update business hours
     */
    public function updateBusinessHours(int $userId, array $hoursData): array
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        DB::beginTransaction();
        try {
            // Delete existing hours
            $business->hours()->delete();

            // Create new hours
            foreach ($hoursData as $hourData) {
                BusinessHour::create([
                    'business_id' => $business->id,
                    'day_of_week' => $hourData['day_of_week'],
                    'open_time' => $hourData['open_time'],
                    'close_time' => $hourData['close_time'],
                    'is_closed' => $hourData['is_closed'] ?? false,
                ]);
            }

            DB::commit();

            return $business->hours()
                ->orderBy('day_of_week')
                ->get()
                ->toArray();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get videos for the business
     */
    public function getVideos(int $userId): array
    {
        $business = Business::where('user_id', $userId)->firstOrFail();

        \Log::info('Getting videos for business', [
            'user_id' => $userId,
            'business_id' => $business->id,
            'business_name' => $business->business_name
        ]);

        $videos = $business->videos()
            ->orderBy('created_at', 'desc')
            ->get()
            ->toArray();

        \Log::info('Videos found:', [
            'count' => count($videos),
            'videos' => $videos
        ]);

        return $videos;
    }

    /**
     * Delete business (soft delete)
     * This will cascade delete all related data:
     * - business_hours
     * - services
     * - media_gallery
     * - reviews
     * - follows
     * - videos (and their hashtags, likes, comments)
     * - products
     */
    public function deleteBusiness(Business $business): bool
    {
        \Log::info('Deleting business', [
            'business_id' => $business->id,
            'business_name' => $business->business_name,
            'user_id' => $business->user_id
        ]);

        // Soft delete the business
        // Database cascade deletes will handle related records
        $result = $business->delete();

        \Log::info('Business deleted', [
            'success' => $result,
            'business_id' => $business->id
        ]);

        return $result;
    }
}
