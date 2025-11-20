<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Business\Services\BusinessManagementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessManagementController extends Controller
{
    public function __construct(
        private BusinessManagementService $businessManagementService
    ) {}

    /**
     * Get the authenticated user's business
     */
    public function getMyBusiness(Request $request): JsonResponse
    {
        try {
            $business = $this->businessManagementService->getOwnerBusiness($request->user()->id);

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'No business found for this user'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $business
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch business',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update business details
     */
    public function updateBusiness(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'business_name' => 'sometimes|string|max:255',
            'business_type' => 'sometimes|in:barber,nail_studio,hair_salon,massage',
            'description' => 'nullable|string',
            'phone' => 'nullable|string|max:20',
            'email' => 'nullable|email|max:255',
            'website' => 'nullable|url|max:255',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip_code' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'logo' => 'nullable|string|max:500',
            'cover_image' => 'nullable|string|max:500',
        ]);

        try {
            $business = $this->businessManagementService->updateBusiness(
                $request->user()->id,
                $validated
            );

            return response()->json([
                'message' => 'Business updated successfully',
                'data' => $business
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to update business',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business statistics
     */
    public function getStatistics(Request $request): JsonResponse
    {
        try {
            $stats = $this->businessManagementService->getBusinessStatistics($request->user()->id);

            return response()->json([
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all services for the business
     */
    public function getServices(Request $request): JsonResponse
    {
        try {
            $services = $this->businessManagementService->getServices($request->user()->id);

            return response()->json([
                'data' => $services
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch services',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new service
     */
    public function createService(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'duration' => 'required|integer|min:1',
            'is_active' => 'boolean',
        ]);

        try {
            $service = $this->businessManagementService->createService(
                $request->user()->id,
                $validated
            );

            return response()->json([
                'message' => 'Service created successfully',
                'data' => $service
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a service
     */
    public function updateService(Request $request, string $uuid): JsonResponse
    {
        \Log::info('Service update request:', [
            'uuid' => $uuid,
            'data' => $request->all()
        ]);

        try {
            $validated = $request->validate([
                'name' => 'sometimes|string|max:255',
                'description' => 'nullable|string',
                'price' => 'sometimes|numeric|min:0',
                'duration' => 'sometimes|integer|min:1',
                'is_active' => 'boolean',
            ]);

            \Log::info('Service update validated:', $validated);

            $service = $this->businessManagementService->updateService(
                $request->user()->id,
                $uuid,
                $validated
            );

            \Log::info('Service updated successfully:', $service->toArray());

            return response()->json([
                'message' => 'Service updated successfully',
                'data' => $service
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Service update validation failed:', [
                'errors' => $e->errors()
            ]);
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Service update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a service
     */
    public function deleteService(Request $request, string $uuid): JsonResponse
    {
        try {
            $this->businessManagementService->deleteService($request->user()->id, $uuid);

            return response()->json([
                'message' => 'Service deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to delete service',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business hours
     */
    public function getBusinessHours(Request $request): JsonResponse
    {
        try {
            $hours = $this->businessManagementService->getBusinessHours($request->user()->id);

            return response()->json([
                'data' => $hours
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to fetch business hours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update business hours
     */
    public function updateBusinessHours(Request $request): JsonResponse
    {
        \Log::info('Business hours update request:', $request->all());

        $validated = $request->validate([
            'hours' => 'required|array',
            'hours.*.day_of_week' => 'required|integer|between:0,6',
            'hours.*.open_time' => 'nullable|date_format:H:i',
            'hours.*.close_time' => 'nullable|date_format:H:i',
            'hours.*.is_closed' => 'nullable|boolean',
        ]);

        try {
            $hours = $this->businessManagementService->updateBusinessHours(
                $request->user()->id,
                $validated['hours']
            );

            return response()->json([
                'message' => 'Business hours updated successfully',
                'data' => $hours
            ]);
        } catch (\Exception $e) {
            \Log::error('Business hours update failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'message' => 'Failed to update business hours',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business videos
     */
    public function getVideos(Request $request): JsonResponse
    {
        try {
            $videos = $this->businessManagementService->getVideos($request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $videos
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch videos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete the authenticated user's business
     */
    public function deleteBusiness(Request $request): JsonResponse
    {
        try {
            $business = $this->businessManagementService->getOwnerBusiness($request->user()->id);

            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'No business found for this user'
                ], 404);
            }

            // Delete the business (soft delete)
            // Due to cascade deletes in the database, this will also delete:
            // - business_hours
            // - services
            // - media_gallery
            // - reviews
            // - follows
            // - videos (and their hashtags, likes, comments)
            // - products
            $this->businessManagementService->deleteBusiness($business);

            return response()->json([
                'success' => true,
                'message' => 'Business deleted successfully'
            ]);
        } catch (\Exception $e) {
            \Log::error('Business deletion failed:', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete business',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
