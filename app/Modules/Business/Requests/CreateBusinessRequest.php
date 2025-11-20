<?php

namespace App\Modules\Business\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateBusinessRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Only business-type users can create businesses
        return $this->user() && $this->user()->user_type === 'business';
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'business_name' => ['required', 'string', 'max:255'],
            'business_type' => ['required', 'in:barber,nail_studio,hair_salon,massage'],
            'description' => ['nullable', 'string', 'max:1000'],
            'phone' => ['nullable', 'string', 'max:20'],
            'email' => ['nullable', 'email', 'max:255'],
            'website' => ['nullable', 'url', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:100'],
            'state' => ['nullable', 'string', 'max:100'],
            'zip_code' => ['nullable', 'string', 'max:20'],
            'country' => ['nullable', 'string', 'max:100'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'logo' => ['nullable', 'string', 'max:500'],
            'cover_image' => ['nullable', 'string', 'max:500'],
            'hours' => ['nullable', 'array'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.open_time' => ['required', 'date_format:H:i'],
            'hours.*.close_time' => ['required', 'date_format:H:i'],
            'hours.*.is_closed' => ['nullable', 'boolean'],
            'services' => ['nullable', 'array'],
            'services.*.name' => ['required', 'string', 'max:255'],
            'services.*.description' => ['nullable', 'string', 'max:500'],
            'services.*.price' => ['required', 'numeric', 'min:0'],
            'services.*.duration_minutes' => ['nullable', 'integer', 'min:1'],
            'services.*.is_available' => ['nullable', 'boolean'],
        ];
    }
}
