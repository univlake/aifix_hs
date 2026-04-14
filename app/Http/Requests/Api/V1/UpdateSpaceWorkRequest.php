<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSpaceWorkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|nullable|string|max:255',
            'space_work_type_id' => 'sometimes|nullable|integer',
            'size' => 'sometimes|nullable|string|max:255',
            'word_content' => 'sometimes|nullable|string',
            'people_num' => 'sometimes|nullable|integer',
            'hazard_id' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'size.max' => '不能超过255个字符',
            'hazard_id.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
