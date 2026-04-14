<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSpecialEquipmentStaffRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|nullable|string|max:255',
            'cert_title' => 'sometimes|nullable|string|max:255',
            'cert_number' => 'sometimes|nullable|string|max:255',
            'valid_period' => 'sometimes|nullable|date',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => '不能超过255个字符',
            'cert_title.max' => '不能超过255个字符',
            'cert_number.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
