<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHealthFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'sometimes|required|string|max:255',
            'number' => 'sometimes|nullable|string|max:255',
            'department' => 'sometimes|nullable|string|max:255',
            'post' => 'sometimes|nullable|string|max:255',
            'checkup_date' => 'sometimes|nullable|date',
            'checkup_expiry' => 'sometimes|nullable|string',
            'review_situation' => 'sometimes|nullable|string|max:255',
            'handling_opinions' => 'sometimes|nullable|string|max:255',
            'process_result' => 'sometimes|nullable|string|max:255',
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|required|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'number.max' => '不能超过255个字符',
            'department.max' => '不能超过255个字符',
            'post.max' => '不能超过255个字符',
            'review_situation.max' => '不能超过255个字符',
            'handling_opinions.max' => '不能超过255个字符',
            'process_result.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
