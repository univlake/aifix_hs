<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateThreeTogetherRequest extends FormRequest
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
            'three_together_type' => 'sometimes|nullable|string|max:255',
            'establish_time' => 'sometimes|nullable|date',
            'establish_section' => 'sometimes|nullable|string|max:255',
            'status' => 'sometimes|nullable|string|max:255',
            'design_unit_id' => 'sometimes|nullable|integer',
            'design_annex_url' => 'sometimes|nullable|string',
            'evaluation_unit_id' => 'sometimes|nullable|integer',
            'write_time' => 'sometimes|nullable|date',
            'construction_comment' => 'sometimes|nullable|string',
            'safety_requirements' => 'sometimes|nullable|string',
            'complete_comment' => 'sometimes|nullable|string',
            'acceptance' => 'sometimes|nullable|string',
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
