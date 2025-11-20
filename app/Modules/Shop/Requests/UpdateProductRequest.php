<?php

namespace App\Modules\Shop\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        $productId = $this->route('uuid');

        return [
            'category_id' => 'nullable|exists:product_categories,id',
            'name' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'price' => 'sometimes|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku,'.$productId.',uuid',
            'barcode' => 'nullable|string|max:100',
            'stock_quantity' => 'sometimes|integer|min:0',
            'track_inventory' => 'sometimes|boolean',
            'is_available' => 'sometimes|boolean',
            'weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|in:kg,g,lb,oz',
            'images' => 'nullable|array',
            'images.*' => 'string',
            'replace_images' => 'boolean',
        ];
    }
}
