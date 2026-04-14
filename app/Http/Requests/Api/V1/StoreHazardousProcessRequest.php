<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreHazardousProcessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'process_type_id' => 'nullable|integer',
            'position' => 'nullable|string|max:255',
            'hazardous_chemical_id' => 'nullable|integer',
            'dangerous_equipment_id' => 'nullable|integer',
            'other_equipment_name' => 'nullable|string|max:255',
            'operating_people_num' => 'nullable|integer',
            'is_online_test' => 'nullable|integer',
            'is_automatic' => 'nullable|integer',
            'is_control' => 'nullable|integer',
            'is_dust' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'position.max' => '不能超过255个字符',
            'other_equipment_name.max' => '不能超过255个字符',
        ];
    }
}
