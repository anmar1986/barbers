<?php

namespace App\Modules\Business\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Business\Models\Business;
use App\Modules\Business\Models\Service;
use App\Modules\Business\Requests\AddReviewRequest;
use App\Modules\Business\Requests\AddServiceRequest;
use App\Modules\Business\Requests\CreateBusinessRequest;
use App\Modules\Business\Requests\UpdateBusinessHoursRequest;
use App\Modules\Business\Requests\UpdateBusinessRequest;
use App\Modules\Business\Services\BusinessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BusinessController extends Controller
{
    public function __construct(
        private BusinessService $businessService
    ) {}

    /**
     * Get all businesses with optional filters.
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'business_type',
            'city',
            'search',
            'verified',
            'order_by',
            'order_direction'
        ]);

        $businesses = $this->businessService->getAllBusinesses($filters);

        return response()->json([
            'success' => true,
            'data' => $businesses,
        ]);
    }

    /**
     * Get a single business by UUID.
     */
    public function show(string $uuid): JsonResponse
    {
        $business = $this->businessService->getBusinessByUuid($uuid);

        if (!$business) {
            return response()->json([
                'success' => false,
                'message' => 'Business not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $business,
        ]);
    }

    /**
     * Create a new business.
     */
    public function store(CreateBusinessRequest $request): JsonResponse
    {
        $business = $this->businessService->createBusiness(
            $request->user()->id,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Business created successfully',
            'data' => $business,
        ], 201);
    }

    /**
     * Update business information.
     */
    public function update(UpdateBusinessRequest $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if user owns the business
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $business = $this->businessService->updateBusiness(
            $business,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Business updated successfully',
            'data' => $business,
        ]);
    }

    /**
     * Delete business.
     */
    public function destroy(Request $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if user owns the business
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $this->businessService->deleteBusiness($business);

        return response()->json([
            'success' => true,
            'message' => 'Business deleted successfully',
        ]);
    }

    /**
     * Update business hours.
     */
    public function updateHours(UpdateBusinessHoursRequest $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if user owns the business
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $hours = $this->businessService->updateBusinessHours(
            $business,
            $request->validated()['hours']
        );

        return response()->json([
            'success' => true,
            'message' => 'Business hours updated successfully',
            'data' => $hours,
        ]);
    }

    /**
     * Add a service to business.
     */
    public function addService(AddServiceRequest $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if user owns the business
        if ($business->user_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $service = $this->businessService->addService(
            $business,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Service added successfully',
            'data' => $service,
        ], 201);
    }

    /**
     * Update a service.
     */
    public function updateService(AddServiceRequest $request, string $uuid, int $serviceId): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();
        $service = Service::findOrFail($serviceId);

        // Check if user owns the business and service belongs to business
        if ($business->user_id !== $request->user()->id || $service->business_id !== $business->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $service = $this->businessService->updateService(
            $service,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Service updated successfully',
            'data' => $service,
        ]);
    }

    /**
     * Delete a service.
     */
    public function deleteService(Request $request, string $uuid, int $serviceId): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();
        $service = Service::findOrFail($serviceId);

        // Check if user owns the business and service belongs to business
        if ($business->user_id !== $request->user()->id || $service->business_id !== $business->id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        $this->businessService->deleteService($service);

        return response()->json([
            'success' => true,
            'message' => 'Service deleted successfully',
        ]);
    }

    /**
     * Get business reviews.
     */
    public function reviews(string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();
        $reviews = $this->businessService->getBusinessReviews($business);

        return response()->json([
            'success' => true,
            'data' => $reviews,
        ]);
    }

    /**
     * Add a review to business.
     */
    public function addReview(AddReviewRequest $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        $review = $this->businessService->addReview(
            $business,
            $request->user()->id,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Review added successfully',
            'data' => $review,
        ], 201);
    }

    /**
     * Follow a business.
     */
    public function follow(Request $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if already following
        if ($this->businessService->isFollowing($business, $request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Already following this business',
            ], 400);
        }

        $this->businessService->followBusiness($business, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Business followed successfully',
        ]);
    }

    /**
     * Unfollow a business.
     */
    public function unfollow(Request $request, string $uuid): JsonResponse
    {
        $business = Business::where('uuid', $uuid)->firstOrFail();

        // Check if not following
        if (!$this->businessService->isFollowing($business, $request->user()->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Not following this business',
            ], 400);
        }

        $this->businessService->unfollowBusiness($business, $request->user()->id);

        return response()->json([
            'success' => true,
            'message' => 'Business unfollowed successfully',
        ]);
    }
}
