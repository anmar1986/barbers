<?php

namespace App\Modules\Shop\Services;

use App\Modules\Shop\Models\Product;
use App\Modules\Shop\Models\ProductImage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductService
{
    /**
     * Get all products with filters and pagination
     */
    public function getAllProducts(array $filters = [])
    {
        $query = Product::with(['business', 'category', 'images'])
            ->where('is_available', true);

        // Filter by business
        if (! empty($filters['business_id'])) {
            $query->where('business_id', $filters['business_id']);
        }

        // Filter by category
        if (! empty($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        // Filter by price range
        if (! empty($filters['min_price'])) {
            $query->where('price', '>=', $filters['min_price']);
        }
        if (! empty($filters['max_price'])) {
            $query->where('price', '<=', $filters['max_price']);
        }

        // Filter by stock availability
        if (! empty($filters['in_stock'])) {
            $query->where('stock_quantity', '>', 0);
        }

        // Search by name or description
        if (! empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', "%{$search}%")
                    ->orWhere('description', 'LIKE', "%{$search}%");
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';

        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'rating':
                $query->orderBy('rating', 'desc');
                break;
            case 'popular':
                $query->orderBy('view_count', 'desc');
                break;
            default:
                $query->orderBy($sortBy, $sortOrder);
        }

        return $query->paginate($filters['per_page'] ?? 20);
    }

    /**
     * Get product by UUID
     */
    public function getProductByUuid(string $uuid)
    {
        $product = Product::with(['business', 'category', 'images'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        // Increment view count
        Product::where('id', $product->id)->increment('view_count');

        return $product;
    }

    /**
     * Create new product
     */
    public function createProduct(array $data, $businessId)
    {
        DB::beginTransaction();
        try {
            // Generate UUID and slug
            $data['uuid'] = (string) Str::uuid();
            $data['slug'] = Str::slug($data['name']).'-'.substr($data['uuid'], 0, 8);
            $data['business_id'] = $businessId;

            // Create product
            $product = Product::create($data);

            // Handle product images if provided
            if (! empty($data['images'])) {
                foreach ($data['images'] as $index => $imageUrl) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imageUrl,
                        'display_order' => $index,
                        'is_primary' => $index === 0,
                    ]);
                }
            }

            DB::commit();

            return $product->load('images', 'business', 'category');

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update product
     */
    public function updateProduct(string $uuid, array $data, $userId)
    {
        DB::beginTransaction();
        try {
            /** @var \App\Modules\Shop\Models\Product $product */
            $product = Product::where('uuid', $uuid)->firstOrFail();

            // Check authorization - only business owner can update
            /** @var \App\Modules\Business\Models\Business $business */
            $business = $product->business;
            if ($business->user_id !== $userId) {
                throw new \Exception('Unauthorized to update this product');
            }

            // Update slug if name changed
            if (! empty($data['name']) && $data['name'] !== $product->name) {
                $data['slug'] = Str::slug($data['name']).'-'.substr($product->uuid, 0, 8);
            }

            $product->update($data);

            // Handle image updates if provided
            if (isset($data['images'])) {
                // Delete old images if replacing
                if (! empty($data['replace_images'])) {
                    /** @var \App\Modules\Shop\Models\ProductImage $image */
                    foreach ($product->images as $image) {
                        Storage::disk('public')->delete($image->image_url);
                        $image->delete();
                    }
                }

                // Add new images
                foreach ($data['images'] as $index => $imageUrl) {
                    ProductImage::create([
                        'product_id' => $product->id,
                        'image_url' => $imageUrl,
                        'display_order' => $index,
                        'is_primary' => $index === 0 && empty($product->images),
                    ]);
                }
            }

            DB::commit();

            return $product->fresh(['images', 'business', 'category']);

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Delete product
     */
    public function deleteProduct(string $uuid, $userId)
    {
        DB::beginTransaction();
        try {
            /** @var \App\Modules\Shop\Models\Product $product */
            $product = Product::where('uuid', $uuid)->firstOrFail();

            // Check authorization
            /** @var \App\Modules\Business\Models\Business $business */
            $business = $product->business;
            if ($business->user_id !== $userId) {
                throw new \Exception('Unauthorized to delete this product');
            }

            // Delete product images from storage
            /** @var \App\Modules\Shop\Models\ProductImage $image */
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image->image_url);
            }

            // Soft delete product
            $product->delete();

            DB::commit();

            return true;

        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }
    }

    /**
     * Update product stock
     */
    public function updateStock(string $uuid, int $quantity, $userId)
    {
        /** @var \App\Modules\Shop\Models\Product $product */
        $product = Product::where('uuid', $uuid)->firstOrFail();

        // Check authorization
        /** @var \App\Modules\Business\Models\Business $business */
        $business = $product->business;
        if ($business->user_id !== $userId) {
            throw new \Exception('Unauthorized to update stock');
        }

        $product->update(['stock_quantity' => $quantity]);

        return $product;
    }

    /**
     * Add product review
     */
    public function addProductReview(string $uuid, array $reviewData, $userId)
    {
        $product = Product::where('uuid', $uuid)->firstOrFail();

        // Create review (implementation would depend on your review system)
        // For now, just update the product rating

        Product::where('id', $product->id)->increment('review_count');

        // Recalculate average rating
        $newRating = (($product->rating * ($product->review_count - 1)) + $reviewData['rating']) / $product->review_count;
        $product->update(['rating' => round($newRating, 2)]);

        return $product;
    }

    /**
     * Check and reduce stock for order
     */
    public function reduceStock(int $productId, int $quantity)
    {
        $product = Product::findOrFail($productId);

        if ($product->track_inventory) {
            if ($product->stock_quantity < $quantity) {
                throw new \Exception("Insufficient stock for product: {$product->name}");
            }

            Product::where('id', $product->id)->decrement('stock_quantity', $quantity);
        }

        return $product;
    }

    /**
     * Restore stock (for cancelled orders)
     */
    public function restoreStock(int $productId, int $quantity)
    {
        $product = Product::findOrFail($productId);

        if ($product->track_inventory) {
            Product::where('id', $product->id)->increment('stock_quantity', $quantity);
        }

        return $product;
    }
}
