<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreDesignUnitRequest extends FormRequest
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
            'qualification_name' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'contact_tel' => 'nullable|string|max:255',
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
            'qualification_name.max' => '不能超过255个字符',
            'contact.max' => '不能超过255个字符',
            'contact_tel.max' => '不能超过255个字符',
        ];
    }
}
