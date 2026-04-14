<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreHealthFileRequest extends FormRequest
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
            'number' => 'nullable|string|max:255',
            'department' => 'nullable|string|max:255',
            'post' => 'nullable|string|max:255',
            'checkup_date' => 'nullable|date',
            'checkup_expiry' => 'nullable|string',
            'review_situation' => 'nullable|string|max:255',
            'handling_opinions' => 'nullable|string|max:255',
            'process_result' => 'nullable|string|max:255',
            'annex_url' => 'nullable|string',
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
            'number.max' => '不能超过255个字符',
            'department.max' => '不能超过255个字符',
            'post.max' => '不能超过255个字符',
            'review_situation.max' => '不能超过255个字符',
            'handling_opinions.max' => '不能超过255个字符',
            'process_result.max' => '不能超过255个字符',
        ];
    }
}
