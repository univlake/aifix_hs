<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreEliminationControlStaffRequest extends FormRequest
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
            'cert_title' => 'nullable|string|max:255',
            'cert_number' => 'nullable|string|max:255',
            'valid_period' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'cert_title.max' => '不能超过255个字符',
            'cert_number.max' => '不能超过255个字符',
        ];
    }
}
