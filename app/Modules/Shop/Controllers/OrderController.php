<?php

namespace App\Modules\Shop\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shop\Services\OrderService;
use App\Modules\Shop\Requests\CreateOrderRequest;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    private $orderService;

    public function __construct(OrderService $orderService)
    {
        $this->orderService = $orderService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Get user's orders
     * GET /api/v1/orders
     */
    public function index(Request $request)
    {
        try {
            $filters = [
                'status' => $request->status,
                'payment_status' => $request->payment_status,
                'per_page' => $request->per_page
            ];

            $orders = $this->orderService->getUserOrders($request->user()->id, $filters);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get single order by order number
     * GET /api/v1/orders/{orderNumber}
     */
    public function show(Request $request, string $orderNumber)
    {
        try {
            $order = $this->orderService->getOrderByNumber($orderNumber, $request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $order
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching order',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create order (checkout)
     * POST /api/v1/checkout
     */
    public function checkout(CreateOrderRequest $request)
    {
        try {
            $order = $this->orderService->createOrderFromCart(
                $request->user()->id,
                $request->validated()
            );

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Update order status
     * PUT /api/v1/orders/{orderNumber}/status
     */
    public function updateStatus(Request $request, string $orderNumber)
    {
        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,shipped,delivered,cancelled,refunded'
        ]);

        try {
            $order = $this->orderService->updateOrderStatus(
                $orderNumber,
                $request->status,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Order status updated',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 403);
        }
    }

    /**
     * Cancel order
     * POST /api/v1/orders/{orderNumber}/cancel
     */
    public function cancel(Request $request, string $orderNumber)
    {
        try {
            $order = $this->orderService->cancelOrder($orderNumber, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Order cancelled successfully',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 400);
        }
    }

    /**
     * Get business orders
     * GET /api/v1/business/orders
     */
    public function businessOrders(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->user_type !== 'business') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only business users can access this endpoint'
                ], 403);
            }

            $business = $user->business;
            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business profile not found'
                ], 404);
            }

            $filters = [
                'status' => $request->status,
                'per_page' => $request->per_page
            ];

            $orders = $this->orderService->getBusinessOrders($business->id, $filters);

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching business orders',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get business order statistics
     * GET /api/v1/business/orders/stats
     */
    public function businessOrderStats(Request $request)
    {
        try {
            $user = $request->user();

            if ($user->user_type !== 'business') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only business users can access this endpoint'
                ], 403);
            }

            $business = $user->business;
            if (!$business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Business profile not found'
                ], 404);
            }

            $stats = $this->orderService->getBusinessOrderStats($business->id);

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
