<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreHazardousChemicalRequest extends FormRequest
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
            'alias' => 'nullable|string|max:255',
            'is_supervision' => 'nullable|integer',
            'is_toxin' => 'nullable|integer',
            'is_explosion' => 'nullable|integer',
            'is_easy_explode' => 'nullable|integer',
            'is_narcotics' => 'nullable|integer',
            'is_monitor' => 'nullable|integer',
            'is_mixing' => 'nullable|integer',
            'cas' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
            'temperature' => 'nullable|string|max:255',
            'storage' => 'nullable|string|max:255',
            'year_use' => 'nullable|string|max:255',
            'year_use_unit' => 'nullable|string|max:255',
            'storage_unit' => 'nullable|string|max:255',
            'pressure' => 'nullable|string|max:255',
            'pressure_unit' => 'nullable|string|max:255',
            'fire_class' => 'nullable|string|max:255',
            'matter_state' => 'nullable|string|max:255',
            'msds' => 'nullable|string|max:255',
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
        ];
    }
}
