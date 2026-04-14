<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpertInspectionUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => 'sometimes|nullable|integer',
            'comment' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [];
    }
}
