<?php

namespace App\Modules\Shop\Models;

use App\Modules\Business\Models\Business;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'business_id',
        'quantity',
        'price',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'price' => 'decimal:2',
            'total' => 'decimal:2',
        ];
    }

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function business()
    {
        return $this->belongsTo(Business::class);
    }
}
