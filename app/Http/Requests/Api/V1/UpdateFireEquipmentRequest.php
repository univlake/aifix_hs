<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFireEquipmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'equipment_name' => 'sometimes|nullable|string|max:255',
            'utilized_location' => 'sometimes|nullable|string|max:255',
            'special_type' => 'sometimes|nullable|string|max:255',
            'use_time' => 'sometimes|nullable|date',
            'automation_type' => 'sometimes|nullable|string|max:255',
            'maintain_info' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'equipment_name.max' => '不能超过255个字符',
            'utilized_location.max' => '不能超过255个字符',
            'special_type.max' => '不能超过255个字符',
            'automation_type.max' => '不能超过255个字符',
            'maintain_info.max' => '不能超过255个字符',
        ];
    }
}
