<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreOccupationalHealthSafetyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer|unique:occupational_health_safeties',
            'certification_body' => 'nullable|string|max:255',
            'standard_edition' => 'nullable|string|max:255',
            'get_time' => 'nullable|date',
            'valid_period' => 'nullable|date',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'company_id.unique' => '已存在',
        ];
    }
}
