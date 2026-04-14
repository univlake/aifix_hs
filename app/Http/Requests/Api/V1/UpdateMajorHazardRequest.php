<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMajorHazardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'level' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'r_value' => 'sometimes|nullable|string|max:255',
            'is_sis' => 'sometimes|nullable|integer',
            'sil_level' => 'sometimes|nullable|string|max:255',
            'detect_parameter' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'level.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'r_value.max' => '不能超过255个字符',
            'sil_level.max' => '不能超过255个字符',
            'detect_parameter.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
