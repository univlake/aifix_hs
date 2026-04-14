<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHazardousChemicalRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'alias' => 'sometimes|nullable|string|max:255',
            'is_supervision' => 'sometimes|nullable|integer',
            'is_toxin' => 'sometimes|nullable|integer',
            'is_explosion' => 'sometimes|nullable|integer',
            'is_easy_explode' => 'sometimes|nullable|integer',
            'is_narcotics' => 'sometimes|nullable|integer',
            'is_monitor' => 'sometimes|nullable|integer',
            'is_mixing' => 'sometimes|nullable|integer',
            'cas' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'temperature' => 'sometimes|nullable|string|max:255',
            'storage' => 'sometimes|nullable|string|max:255',
            'year_use' => 'sometimes|nullable|string|max:255',
            'year_use_unit' => 'sometimes|nullable|string|max:255',
            'storage_unit' => 'sometimes|nullable|string|max:255',
            'pressure' => 'sometimes|nullable|string|max:255',
            'pressure_unit' => 'sometimes|nullable|string|max:255',
            'fire_class' => 'sometimes|nullable|string|max:255',
            'matter_state' => 'sometimes|nullable|string|max:255',
            'msds' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'alias.max' => '不能超过255个字符',
            'cas.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'temperature.max' => '不能超过255个字符',
            'storage.max' => '不能超过255个字符',
            'year_use.max' => '不能超过255个字符',
            'year_use_unit.max' => '不能超过255个字符',
            'storage_unit.max' => '不能超过255个字符',
            'pressure.max' => '不能超过255个字符',
            'pressure_unit.max' => '不能超过255个字符',
            'fire_class.max' => '不能超过255个字符',
            'matter_state.max' => '不能超过255个字符',
            'msds.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
