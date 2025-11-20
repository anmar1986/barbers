<?php

namespace App\Modules\Shop\Controllers;

use App\Http\Controllers\Controller;
use App\Modules\Shop\Requests\CreateProductRequest;
use App\Modules\Shop\Requests\UpdateProductRequest;
use App\Modules\Shop\Services\ProductService;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    private $productService;

    public function __construct(ProductService $productService)
    {
        $this->productService = $productService;
    }

    /**
     * Get all products with filters
     * GET /api/v1/products
     */
    public function index(Request $request)
    {
        try {
            $filters = [
                'business_id' => $request->business_id,
                'category_id' => $request->category_id,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'in_stock' => $request->in_stock,
                'search' => $request->search,
                'sort_by' => $request->sort_by,
                'sort_order' => $request->sort_order,
                'per_page' => $request->per_page,
            ];

            $products = $this->productService->getAllProducts($filters);

            return response()->json([
                'success' => true,
                'data' => $products,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get single product by UUID
     * GET /api/v1/products/{uuid}
     */
    public function show(string $uuid)
    {
        try {
            $product = $this->productService->getProductByUuid($uuid);

            return response()->json([
                'success' => true,
                'data' => $product,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create new product
     * POST /api/v1/products
     */
    public function store(CreateProductRequest $request)
    {
        try {
            // Get user's business
            $user = $request->user();

            if ($user->user_type !== 'business') {
                return response()->json([
                    'success' => false,
                    'message' => 'Only business users can create products',
                ], 403);
            }

            $business = $user->business;
            if (! $business) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please create a business profile first',
                ], 400);
            }

            $product = $this->productService->createProduct(
                $request->validated(),
                $business->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => $product,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update product
     * PUT /api/v1/products/{uuid}
     */
    public function update(UpdateProductRequest $request, string $uuid)
    {
        try {
            $product = $this->productService->updateProduct(
                $uuid,
                $request->validated(),
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => $product,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Delete product
     * DELETE /api/v1/products/{uuid}
     */
    public function destroy(Request $request, string $uuid)
    {
        try {
            $this->productService->deleteProduct($uuid, $request->user()->id);

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Update product stock
     * PUT /api/v1/products/{uuid}/stock
     */
    public function updateStock(Request $request, string $uuid)
    {
        $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        try {
            $product = $this->productService->updateStock(
                $uuid,
                $request->quantity,
                $request->user()->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Stock updated successfully',
                'data' => $product,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    /**
     * Get products by category
     * GET /api/v1/products/category/{slug}
     */
    public function byCategory(Request $request, string $slug)
    {
        try {
            $filters = array_merge($request->all(), ['category_slug' => $slug]);
            $products = $this->productService->getAllProducts($filters);

            return response()->json([
                'success' => true,
                'data' => $products,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
