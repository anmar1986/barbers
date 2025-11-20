<?php

namespace App\Modules\Shop\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shop\Services\CartService;
use Illuminate\Http\Request;

class CartController extends Controller
{
    private $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
        $this->middleware('auth:sanctum');
    }

    /**
     * Get user's cart
     * GET /api/v1/cart
     */
    public function index(Request $request)
    {
        try {
            $cart = $this->cartService->getCart($request->user()->id);

            return response()->json([
                'success' => true,
                'data' => $cart,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add item to cart
     * POST /api/v1/cart/items
     */
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|integer|exists:products,id',
            'quantity' => 'integer|min:1',
        ]);

        try {
            $cart = $this->cartService->addToCart(
                $request->user()->id,
                $request->product_id,
                $request->quantity ?? 1
            );

            return response()->json([
                'success' => true,
                'message' => 'Product added to cart',
                'data' => $cart,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update cart item quantity
     * PUT /api/v1/cart/items/{cartItemId}
     */
    public function updateItem(Request $request, string $cartItemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        try {
            $cart = $this->cartService->updateQuantity(
                $request->user()->id,
                $cartItemId,
                $request->quantity
            );

            return response()->json([
                'success' => true,
                'message' => 'Cart updated',
                'data' => $cart,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove item from cart
     * DELETE /api/v1/cart/items/{cartItemId}
     */
    public function removeItem(Request $request, string $cartItemId)
    {
        try {
            $cart = $this->cartService->removeFromCart(
                $request->user()->id,
                $cartItemId
            );

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
                'data' => $cart,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Clear entire cart
     * DELETE /api/v1/cart/clear
     */
    public function clear(Request $request)
    {
        try {
            $cart = $this->cartService->clearCart($request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared',
                'data' => $cart,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Calculate cart totals
     * POST /api/v1/cart/calculate
     */
    public function calculateTotals(Request $request)
    {
        try {
            $totals = $this->cartService->calculateTotals(
                $request->user()->id,
                $request->all()
            );

            return response()->json([
                'success' => true,
                'data' => $totals,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error calculating totals',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
