<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreYearStatisticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'company_name' => 'nullable|string|max:255',
            'base_area' => 'nullable|string|max:255',
            'enterprise_type' => 'nullable|string|max:255',
            'safety_funding' => 'nullable|string|max:255',
            'fire_fighting' => 'nullable|string|max:255',
            'compliance_time' => 'nullable|date',
            'revaluation_time' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'company_name.max' => '不能超过255个字符',
            'base_area.max' => '不能超过255个字符',
            'enterprise_type.max' => '不能超过255个字符',
            'safety_funding.max' => '不能超过255个字符',
            'fire_fighting.max' => '不能超过255个字符',
        ];
    }
}
