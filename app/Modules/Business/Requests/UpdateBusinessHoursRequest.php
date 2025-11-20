<?php

namespace App\Modules\Business\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBusinessHoursRequest extends FormRequest
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
            'hours' => ['required', 'array'],
            'hours.*.day_of_week' => ['required', 'integer', 'between:0,6'],
            'hours.*.open_time' => ['required', 'date_format:H:i'],
            'hours.*.close_time' => ['required', 'date_format:H:i'],
            'hours.*.is_closed' => ['nullable', 'boolean'],
        ];
    }
}
