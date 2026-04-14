<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMajorHazardousProcessRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|nullable|string|max:255',
            'dangerous_craft_type_id' => 'sometimes|nullable|integer',
            'position' => 'sometimes|nullable|string|max:255',
            'hazardous_chemical_id' => 'sometimes|nullable|integer',
            'dangerous_equipment_id' => 'sometimes|nullable|integer',
            'operating_people_num' => 'sometimes|nullable|integer',
            'temperature' => 'sometimes|nullable|string|max:255',
            'pressure' => 'sometimes|nullable|string|max:255',
            'pressure_unit' => 'sometimes|nullable|string|max:255',
            'is_sis' => 'sometimes|nullable|integer',
            'sil_level' => 'sometimes|nullable|string|max:255',
            'detect_parameter' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'temperature.max' => '不能超过255个字符',
            'pressure.max' => '不能超过255个字符',
            'pressure_unit.max' => '不能超过255个字符',
            'sil_level.max' => '不能超过255个字符',
            'detect_parameter.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
