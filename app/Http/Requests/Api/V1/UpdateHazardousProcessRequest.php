<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHazardousProcessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'process_type_id' => 'sometimes|nullable|integer',
            'position' => 'sometimes|nullable|string|max:255',
            'hazardous_chemical_id' => 'sometimes|nullable|integer',
            'dangerous_equipment_id' => 'sometimes|nullable|integer',
            'other_equipment_name' => 'sometimes|nullable|string|max:255',
            'operating_people_num' => 'sometimes|nullable|integer',
            'is_online_test' => 'sometimes|nullable|integer',
            'is_automatic' => 'sometimes|nullable|integer',
            'is_control' => 'sometimes|nullable|integer',
            'is_dust' => 'sometimes|nullable|integer',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'position.max' => '不能超过255个字符',
            'other_equipment_name.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
