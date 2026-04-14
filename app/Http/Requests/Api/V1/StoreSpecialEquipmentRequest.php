<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpecialEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'equipment_name' => 'nullable|string|max:255',
            'special_type_id' => 'nullable|integer',
            'utilized_location' => 'nullable|string|max:255',
            'norm_model1' => 'nullable|string|max:255',
            'norm_model2' => 'nullable|string|max:255',
            'norm_model3' => 'nullable|string|max:255',
            'norm_model4' => 'nullable|string|max:255',
            'serial_number' => 'nullable|string|max:255',
            'use_time' => 'nullable|date',
            'valid_period' => 'nullable|date',
            'inspect_unit' => 'nullable|string|max:255',
            'maintain_info' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'equipment_name.max' => '不能超过255个字符',
            'utilized_location.max' => '不能超过255个字符',
            'norm_model1.max' => '不能超过255个字符',
            'norm_model2.max' => '不能超过255个字符',
            'norm_model3.max' => '不能超过255个字符',
            'norm_model4.max' => '不能超过255个字符',
            'serial_number.max' => '不能超过255个字符',
            'inspect_unit.max' => '不能超过255个字符',
            'maintain_info.max' => '不能超过255个字符',
        ];
    }
}
