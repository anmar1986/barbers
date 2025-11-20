<?php

namespace App\Modules\Shop\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateProductRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'category_id' => 'nullable|exists:product_categories,id',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'compare_price' => 'nullable|numeric|min:0',
            'cost_per_item' => 'nullable|numeric|min:0',
            'sku' => 'nullable|string|max:100|unique:products,sku',
            'barcode' => 'nullable|string|max:100',
            'stock_quantity' => 'integer|min:0',
            'track_inventory' => 'boolean',
            'is_available' => 'boolean',
            'weight' => 'nullable|numeric|min:0',
            'weight_unit' => 'nullable|in:kg,g,lb,oz',
            'images' => 'nullable|array',
            'images.*' => 'string',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'Product name is required',
            'price.required' => 'Product price is required',
            'price.numeric' => 'Price must be a valid number',
            'stock_quantity.integer' => 'Stock quantity must be a number',
            'sku.unique' => 'SKU already exists',
        ];
    }
}
