<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreMajorHazardousProcessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'dangerous_craft_type_id' => 'nullable|integer',
            'position' => 'nullable|string|max:255',
            'hazardous_chemical_id' => 'nullable|integer',
            'dangerous_equipment_id' => 'nullable|integer',
            'operating_people_num' => 'nullable|integer',
            'temperature' => 'nullable|string|max:255',
            'pressure' => 'nullable|string|max:255',
            'pressure_unit' => 'nullable|string|max:255',
            'is_sis' => 'nullable|integer',
            'sil_level' => 'nullable|string|max:255',
            'detect_parameter' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'temperature.max' => '不能超过255个字符',
            'pressure.max' => '不能超过255个字符',
            'pressure_unit.max' => '不能超过255个字符',
            'sil_level.max' => '不能超过255个字符',
            'detect_parameter.max' => '不能超过255个字符',
        ];
    }
}
