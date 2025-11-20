<?php

namespace App\Modules\Videos\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AddCommentRequest extends FormRequest
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
            'comment_text' => ['required', 'string', 'max:500'],
            'parent_id' => ['nullable', 'exists:video_comments,id'],
        ];
    }
}
