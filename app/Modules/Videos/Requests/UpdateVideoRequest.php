<?php

namespace App\Modules\Videos\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateVideoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:500'],
            'thumbnail_url' => ['nullable', 'string', 'max:500'],
            'is_public' => ['nullable', 'boolean'],
            'status' => ['nullable', 'in:processing,published,failed'],
            'hashtags' => ['nullable', 'array'],
            'hashtags.*' => ['string', 'max:50', 'regex:/^[a-zA-Z0-9_]+$/'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'hashtags.*.regex' => 'Hashtags can only contain letters, numbers, and underscores.',
        ];
    }
}
