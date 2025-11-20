<?php

namespace App\Modules\Shop\Models;

use App\Modules\Business\Models\Business;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'uuid',
        'business_id',
        'category_id',
        'name',
        'slug',
        'description',
        'price',
        'compare_price',
        'cost_per_item',
        'sku',
        'barcode',
        'stock_quantity',
        'track_inventory',
        'is_available',
        'weight',
        'weight_unit',
        'rating',
        'review_count',
        'view_count',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'compare_price' => 'decimal:2',
            'cost_per_item' => 'decimal:2',
            'stock_quantity' => 'integer',
            'track_inventory' => 'boolean',
            'is_available' => 'boolean',
            'weight' => 'decimal:2',
            'rating' => 'decimal:2',
            'review_count' => 'integer',
            'view_count' => 'integer',
        ];
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($product) {
            if (empty($product->uuid)) {
                $product->uuid = (string) Str::uuid();
            }
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    public function getRouteKeyName()
    {
        return 'uuid';
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }

    public function category()
    {
        return $this->belongsTo(ProductCategory::class, 'category_id');
    }

    public function images()
    {
        return $this->hasMany(ProductImage::class);
    }

    public function orderItems()
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * Get the primary image for the product.
     */
    public function primaryImage()
    {
        return $this->hasOne(ProductImage::class)->where('is_primary', true);
    }

    /**
     * Check if product is in stock.
     */
    public function inStock(): bool
    {
        if (! $this->track_inventory) {
            return true;
        }

        return $this->stock_quantity > 0;
    }

    /**
     * Check if product has discount.
     */
    public function hasDiscount(): bool
    {
        return $this->compare_price && $this->compare_price > $this->price;
    }

    /**
     * Get discount percentage.
     */
    public function getDiscountPercentageAttribute(): ?int
    {
        if (! $this->hasDiscount()) {
            return null;
        }

        return round((($this->compare_price - $this->price) / $this->compare_price) * 100);
    }

    /**
     * Increment view count.
     */
    public function incrementViews()
    {
        $this->increment('view_count');
    }

    /**
     * Decrement stock quantity.
     */
    public function decrementStock(int $quantity)
    {
        if ($this->track_inventory) {
            $this->decrement('stock_quantity', $quantity);
        }
    }
}
