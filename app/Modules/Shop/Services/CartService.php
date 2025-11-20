<?php

namespace App\Modules\Shop\Services;

use App\Modules\Shop\Models\Product;
use Illuminate\Support\Facades\Cache;

class CartService
{
    private function getCartKey($userId)
    {
        return "cart:{$userId}";
    }

    /**
     * Get user's cart
     */
    public function getCart($userId)
    {
        $cartItems = Cache::get($this->getCartKey($userId), []);

        // Enrich with product details
        $enrichedCart = [];
        $total = 0;

        foreach ($cartItems as $item) {
            $product = Product::with(['images', 'business'])
                ->find($item['product_id']);

            if ($product && $product->is_available) {
                $itemTotal = $product->price * $item['quantity'];
                $enrichedCart[] = [
                    'cart_item_id' => $item['id'],
                    'product' => $product,
                    'quantity' => $item['quantity'],
                    'price' => $product->price,
                    'subtotal' => $itemTotal,
                ];
                $total += $itemTotal;
            }
        }

        return [
            'items' => $enrichedCart,
            'total' => $total,
            'item_count' => count($enrichedCart),
        ];
    }

    /**
     * Add product to cart
     */
    public function addToCart($userId, int $productId, int $quantity = 1)
    {
        $product = Product::findOrFail($productId);

        // Check availability
        if (! $product->is_available) {
            throw new \Exception('Product is not available');
        }

        // Check stock
        if ($product->track_inventory && $product->stock_quantity < $quantity) {
            throw new \Exception('Insufficient stock');
        }

        $cartKey = $this->getCartKey($userId);
        $cart = Cache::get($cartKey, []);

        // Check if product already in cart
        $found = false;
        foreach ($cart as &$item) {
            if ($item['product_id'] === $productId) {
                $newQuantity = $item['quantity'] + $quantity;

                // Check stock for new quantity
                if ($product->track_inventory && $product->stock_quantity < $newQuantity) {
                    throw new \Exception('Insufficient stock');
                }

                $item['quantity'] = $newQuantity;
                $item['updated_at'] = now()->toDateTimeString();
                $found = true;
                break;
            }
        }

        // Add new item if not found
        if (! $found) {
            $cart[] = [
                'id' => uniqid('cart_'),
                'product_id' => $productId,
                'quantity' => $quantity,
                'added_at' => now()->toDateTimeString(),
                'updated_at' => now()->toDateTimeString(),
            ];
        }

        // Save to cache (24 hours)
        Cache::put($cartKey, $cart, 86400);

        return $this->getCart($userId);
    }

    /**
     * Update cart item quantity
     */
    public function updateQuantity($userId, string $cartItemId, int $quantity)
    {
        if ($quantity < 1) {
            throw new \Exception('Quantity must be at least 1');
        }

        $cartKey = $this->getCartKey($userId);
        $cart = Cache::get($cartKey, []);

        $updated = false;
        foreach ($cart as &$item) {
            if ($item['id'] === $cartItemId) {
                $product = Product::find($item['product_id']);

                // Check stock
                if ($product->track_inventory && $product->stock_quantity < $quantity) {
                    throw new \Exception('Insufficient stock');
                }

                $item['quantity'] = $quantity;
                $item['updated_at'] = now()->toDateTimeString();
                $updated = true;
                break;
            }
        }

        if (! $updated) {
            throw new \Exception('Cart item not found');
        }

        Cache::put($cartKey, $cart, 86400);

        return $this->getCart($userId);
    }

    /**
     * Remove item from cart
     */
    public function removeFromCart($userId, string $cartItemId)
    {
        $cartKey = $this->getCartKey($userId);
        $cart = Cache::get($cartKey, []);

        $cart = array_filter($cart, function ($item) use ($cartItemId) {
            return $item['id'] !== $cartItemId;
        });

        // Re-index array
        $cart = array_values($cart);

        Cache::put($cartKey, $cart, 86400);

        return $this->getCart($userId);
    }

    /**
     * Clear entire cart
     */
    public function clearCart($userId)
    {
        Cache::forget($this->getCartKey($userId));

        return [
            'items' => [],
            'total' => 0,
            'item_count' => 0,
        ];
    }

    /**
     * Get cart items for checkout
     */
    public function getCartForCheckout($userId)
    {
        $cart = $this->getCart($userId);

        if (empty($cart['items'])) {
            throw new \Exception('Cart is empty');
        }

        // Validate all products are still available
        foreach ($cart['items'] as $item) {
            $product = $item['product'];

            if (! $product->is_available) {
                throw new \Exception("Product '{$product->name}' is no longer available");
            }

            if ($product->track_inventory && $product->stock_quantity < $item['quantity']) {
                throw new \Exception("Insufficient stock for '{$product->name}'");
            }
        }

        return $cart;
    }

    /**
     * Calculate cart totals
     */
    public function calculateTotals($userId, array $shippingInfo = [])
    {
        $cart = $this->getCart($userId);

        $subtotal = $cart['total'];
        $tax = $subtotal * 0.10; // 10% tax rate
        $shipping = $shippingInfo['shipping_cost'] ?? 10.00; // Default $10 shipping

        // Free shipping over $100
        if ($subtotal >= 100) {
            $shipping = 0;
        }

        $total = $subtotal + $tax + $shipping;

        return [
            'subtotal' => round($subtotal, 2),
            'tax' => round($tax, 2),
            'shipping' => round($shipping, 2),
            'total' => round($total, 2),
        ];
    }
}
