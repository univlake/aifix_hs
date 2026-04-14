<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreInformationDraftsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'company_name' => 'required|string|max:255',
            'company_id' => 'required|integer',
            'draft_department' => 'nullable|string|max:255',
            'draft_others' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'annex_url' => 'nullable|string|max:255',
            'next_reviewer' => 'nullable|integer',
            'is_top' => 'nullable|integer',
            'status' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => '不能为空',
            'name.string' => '必须是字符串',
            'name.max' => '不能超过255个字符',
            'company_name.required' => '不能为空',
            'company_name.string' => '必须是字符串',
            'company_name.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'draft_department.max' => '不能超过255个字符',
            'draft_others.max' => '不能超过255个字符',
            'annex_url.max' => '不能超过255个字符',
        ];
    }
}
