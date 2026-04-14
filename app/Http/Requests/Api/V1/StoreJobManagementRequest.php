<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobManagementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'department' => 'nullable|string|max:255',
            'content' => 'nullable|string',
            'type' => 'nullable|string|max:255',
            'special_type' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'job_time' => 'nullable|date',
            'unit' => 'nullable|string|max:255',
            'is_outsourcing' => 'nullable|integer',
            'evaluation_unit_id' => 'nullable|integer',
            'job_people_number' => 'nullable|integer',
            'job_people_name' => 'nullable|string|max:255',
            'risk_analysis' => 'nullable|string',
            'risk_protection' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'department.max' => '不能超过255个字符',
            'type.max' => '不能超过255个字符',
            'special_type.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'unit.max' => '不能超过255个字符',
            'job_people_name.max' => '不能超过255个字符',
        ];
    }
}
