<?php

namespace App\Modules\Shop\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateOrderRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

    public function rules()
    {
        return [
            'payment_method' => 'required|in:stripe,paypal,cash_on_delivery,apple_pay,google_pay',
            'shipping_address' => 'required|array',
            'shipping_address.full_name' => 'required|string|max:255',
            'shipping_address.address_line_1' => 'required|string|max:255',
            'shipping_address.address_line_2' => 'nullable|string|max:255',
            'shipping_address.city' => 'required|string|max:100',
            'shipping_address.state' => 'nullable|string|max:100',
            'shipping_address.postal_code' => 'required|string|max:20',
            'shipping_address.country' => 'required|string|max:100',
            'shipping_address.phone' => 'required|string|max:20',
            'billing_address' => 'nullable|array',
            'billing_address.full_name' => 'required_with:billing_address|string|max:255',
            'billing_address.address_line_1' => 'required_with:billing_address|string|max:255',
            'billing_address.address_line_2' => 'nullable|string|max:255',
            'billing_address.city' => 'required_with:billing_address|string|max:100',
            'billing_address.state' => 'nullable|string|max:100',
            'billing_address.postal_code' => 'required_with:billing_address|string|max:20',
            'billing_address.country' => 'required_with:billing_address|string|max:100',
            'shipping_cost' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:500',
        ];
    }

    public function messages()
    {
        return [
            'payment_method.required' => 'Please select a payment method',
            'shipping_address.required' => 'Shipping address is required',
            'shipping_address.full_name.required' => 'Full name is required for shipping',
            'shipping_address.address_line_1.required' => 'Address is required',
            'shipping_address.city.required' => 'City is required',
            'shipping_address.postal_code.required' => 'Postal code is required',
            'shipping_address.country.required' => 'Country is required',
            'shipping_address.phone.required' => 'Phone number is required',
        ];
    }
}
