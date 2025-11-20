<?php

namespace App\Modules\Shop\Models;

use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    protected $fillable = [
        'product_id',
        'image_url',
        'display_order',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'display_order' => 'integer',
            'is_primary' => 'boolean',
        ];
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
