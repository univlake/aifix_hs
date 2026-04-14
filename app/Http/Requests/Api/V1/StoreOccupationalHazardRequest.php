<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreOccupationalHazardRequest extends FormRequest
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
            'type' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'is_declare' => 'nullable|string|max:255',
            'declare_date' => 'nullable|date',
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
            'type.max' => '不能超过255个字符',
            'is_declare.max' => '不能超过255个字符',
        ];
    }
}
