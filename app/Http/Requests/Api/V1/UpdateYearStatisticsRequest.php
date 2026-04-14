<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateYearStatisticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'company_name' => 'sometimes|nullable|string|max:255',
            'base_area' => 'sometimes|nullable|string|max:255',
            'enterprise_type' => 'sometimes|nullable|string|max:255',
            'safety_funding' => 'sometimes|nullable|string|max:255',
            'fire_fighting' => 'sometimes|nullable|string|max:255',
            'compliance_time' => 'sometimes|nullable|date',
            'revaluation_time' => 'sometimes|nullable|date',
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
