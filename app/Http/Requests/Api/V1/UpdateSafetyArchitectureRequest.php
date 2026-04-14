<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSafetyArchitectureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'thumbnail_url' => 'nullable|string',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            // 无需自定义消息
        ];
    }
}
