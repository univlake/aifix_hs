<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreMajorHazardRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'level' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'r_value' => 'nullable|string|max:255',
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
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'level.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'r_value.max' => '不能超过255个字符',
            'sil_level.max' => '不能超过255个字符',
            'detect_parameter.max' => '不能超过255个字符',
        ];
    }
}
