<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreSpaceWorkRequest extends FormRequest
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
            'position' => 'nullable|string|max:255',
            'space_work_type_id' => 'nullable|integer',
            'size' => 'nullable|string|max:255',
            'word_content' => 'nullable|string',
            'people_num' => 'nullable|integer',
            'hazard_id' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'position.max' => '不能超过255个字符',
            'size.max' => '不能超过255个字符',
            'hazard_id.max' => '不能超过255个字符',
        ];
    }
}
