<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProductionStandardizationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'grade' => 'sometimes|required|string|max:255',
            'get_time' => 'nullable|date',
            'valid_period' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'grade.required' => '不能为空',
            'grade.string' => '必须是字符串',
            'grade.max' => '不能超过255个字符',
        ];
    }
}
