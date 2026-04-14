<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHealthCheckupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|required|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'checkup_date' => 'sometimes|nullable|date',
            'checkup_expiry' => 'sometimes|nullable|string',
            'measure' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => '不能为空',
            'type.string' => '必须是字符串',
            'type.max' => '不能超过255个字符',
            'department.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
