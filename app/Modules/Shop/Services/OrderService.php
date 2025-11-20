<?php

namespace App\Modules\Shop\Services;

use App\Modules\Shop\Models\Order;
use App\Modules\Shop\Models\OrderItem;
use App\Modules\Shop\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrderService
{
    private $cartService;
    private $productService;

    public function __construct(CartService $cartService, ProductService $productService)
    {
        $this->cartService = $cartService;
        $this->productService = $productService;
    }

    /**
     * Create order from cart
     */
    public function createOrderFromCart($userId, array $orderData)
    {
        DB::beginTransaction();
        try {
            // Get cart items
            $cart = $this->cartService->getCartForCheckout($userId);

            if (empty($cart['items'])) {
                throw new \Exception('Cart is empty');
            }

            // Calculate totals
            $totals = $this->cartService->calculateTotals($userId, $orderData);

            // Generate unique order number
            $orderNumber = 'ORD-' . strtoupper(Str::random(8)) . '-' . time();

            // Create order
            $order = Order::create([
                'order_number' => $orderNumber,
                'user_id' => $userId,
                'status' => 'pending',
                'subtotal' => $totals['subtotal'],
                'tax' => $totals['tax'],
                'shipping_cost' => $totals['shipping'],
                'total' => $totals['total'],
                'payment_method' => $orderData['payment_method'] ?? 'pending',
                'payment_status' => 'pending',
                'shipping_address' => json_encode($orderData['shipping_address'] ?? []),
                'billing_address' => json_encode($orderData['billing_address'] ?? $orderData['shipping_address'] ?? []),
                'notes' => $orderData['notes'] ?? null
            ]);

            // Create order items and reduce stock
            foreach ($cart['items'] as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem['product']->id,
                    'business_id' => $cartItem['product']->business_id,
                    'quantity' => $cartItem['quantity'],
                    'price' => $cartItem['price'],
                    'total' => $cartItem['subtotal']
                ]);

                // Reduce stock
                $this->productService->reduceStock(
                    $cartItem['product']->id,
                    $cartItem['quantity']
                );
            }

            // Clear cart
            $this->cartService->clearCart($userId);

            DB::commit();

            return $order->load('items.product', 'items.business');

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Get user's orders
     */
    public function getUserOrders($userId, array $filters = [])
    {
        $query = Order::with(['items.product.images', 'items.business'])
            ->where('user_id', $userId);

        // Filter by status
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        // Filter by payment status
        if (!empty($filters['payment_status'])) {
            $query->where('payment_status', $filters['payment_status']);
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 15);
    }

    /**
     * Get order by order number
     */
    public function getOrderByNumber(string $orderNumber, $userId)
    {
        $order = Order::with(['items.product.images', 'items.business'])
            ->where('order_number', $orderNumber)
            ->where('user_id', $userId)
            ->firstOrFail();

        return $order;
    }

    /**
     * Get business orders
     */
    public function getBusinessOrders($businessId, array $filters = [])
    {
        $query = OrderItem::with(['order.user', 'product.images'])
            ->where('business_id', $businessId);

        // Filter by order status
        if (!empty($filters['status'])) {
            $query->whereHas('order', function($q) use ($filters) {
                $q->where('status', $filters['status']);
            });
        }

        return $query->orderBy('created_at', 'desc')
            ->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Update order status
     */
    public function updateOrderStatus(string $orderNumber, string $status, $userId = null, $businessId = null)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        // Authorization check
        if ($userId && $order->user_id !== $userId) {
            throw new \Exception('Unauthorized');
        }

        // Validate status transition
        $validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!in_array($status, $validStatuses)) {
            throw new \Exception('Invalid order status');
        }

        // Handle cancellation - restore stock
        if ($status === 'cancelled' && !in_array($order->status, ['cancelled', 'delivered', 'refunded'])) {
            foreach ($order->items as $item) {
                $this->productService->restoreStock($item->product_id, $item->quantity);
            }
        }

        $order->update(['status' => $status]);

        return $order->fresh(['items.product', 'items.business']);
    }

    /**
     * Update payment status
     */
    public function updatePaymentStatus(string $orderNumber, string $paymentStatus, string $transactionId = null)
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        $validStatuses = ['pending', 'paid', 'failed', 'refunded'];
        if (!in_array($paymentStatus, $validStatuses)) {
            throw new \Exception('Invalid payment status');
        }

        $updateData = ['payment_status' => $paymentStatus];

        if ($transactionId) {
            $updateData['payment_transaction_id'] = $transactionId;
        }

        // Auto-confirm order if payment successful
        if ($paymentStatus === 'paid' && $order->status === 'pending') {
            $updateData['status'] = 'confirmed';
        }

        $order->update($updateData);

        return $order;
    }

    /**
     * Cancel order
     */
    public function cancelOrder(string $orderNumber, $userId)
    {
        $order = Order::where('order_number', $orderNumber)
            ->where('user_id', $userId)
            ->firstOrFail();

        // Can only cancel if not already shipped/delivered
        if (in_array($order->status, ['shipped', 'delivered', 'cancelled'])) {
            throw new \Exception('Cannot cancel order in current status');
        }

        return $this->updateOrderStatus($orderNumber, 'cancelled', $userId);
    }

    /**
     * Get order statistics for business
     */
    public function getBusinessOrderStats($businessId)
    {
        $totalOrders = OrderItem::where('business_id', $businessId)->count();

        $totalRevenue = OrderItem::where('business_id', $businessId)
            ->whereHas('order', function($q) {
                $q->where('payment_status', 'paid');
            })
            ->sum('total');

        $pendingOrders = OrderItem::where('business_id', $businessId)
            ->whereHas('order', function($q) {
                $q->where('status', 'pending');
            })
            ->count();

        $completedOrders = OrderItem::where('business_id', $businessId)
            ->whereHas('order', function($q) {
                $q->where('status', 'delivered');
            })
            ->count();

        return [
            'total_orders' => $totalOrders,
            'total_revenue' => $totalRevenue,
            'pending_orders' => $pendingOrders,
            'completed_orders' => $completedOrders
        ];
    }
}
