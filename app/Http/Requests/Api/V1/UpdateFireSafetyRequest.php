<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFireSafetyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|in:消防安全评估,消防设施检测',
            'skill_unit_id' => 'sometimes|nullable|integer',
            'skill_unit_kid_id' => 'sometimes|nullable|integer',
            'valid_period' => 'sometimes|nullable|string|max:255',
            'annex_url' => 'sometimes|nullable|string',
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
