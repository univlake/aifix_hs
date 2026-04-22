<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAssessDetectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|integer',
            'name' => 'sometimes|string|max:255',
            'assess_detect_type' => 'sometimes|nullable|string|max:64',
            'skill_unit_id' => 'sometimes|nullable|integer',
            'skill_unit_kid_id' => 'sometimes|nullable|integer',
            'valid_period' => 'sometimes|nullable|string|max:64',
            'annex_url' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.integer' => '必须是整数',
            'name.string' => '必须是字符串',
        ];
    }
}
