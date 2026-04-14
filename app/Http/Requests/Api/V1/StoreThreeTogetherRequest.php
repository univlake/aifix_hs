<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreThreeTogetherRequest extends FormRequest
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
            'three_together_type' => 'nullable|string|max:255',
            'establish_time' => 'nullable|date',
            'establish_section' => 'nullable|string|max:255',
            'status' => 'nullable|string|max:255',
            'design_unit_id' => 'nullable|integer',
            'design_annex_url' => 'nullable|string',
            'evaluation_unit_id' => 'nullable|integer',
            'write_time' => 'nullable|date',
            'construction_comment' => 'nullable|string',
            'safety_requirements' => 'nullable|string',
            'complete_comment' => 'nullable|string',
            'acceptance' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'three_together_type.max' => '不能超过255个字符',
            'establish_section.max' => '不能超过255个字符',
            'status.max' => '不能超过255个字符',
        ];
    }
}
