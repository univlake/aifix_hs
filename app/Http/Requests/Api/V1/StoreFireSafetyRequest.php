<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFireSafetyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|in:消防安全评估,消防设施检测',
            'skill_unit_id' => 'nullable|integer',
            'skill_unit_kid_id' => 'nullable|integer',
            'valid_period' => 'nullable|string|max:255',
            'annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',

            'valid_period.max' => '不能超过255个字符',
        ];
    }
}
