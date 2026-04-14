<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBuildingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'area' => 'sometimes|required|string|max:255',
            'fire_class' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
            'title.max' => '不能超过255个字符',
            'area.required' => '不能为空',
            'area.string' => '必须是字符串',
            'area.max' => '不能超过255个字符',
            'fire_class.required' => '不能为空',
            'fire_class.string' => '必须是字符串',
            'fire_class.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
