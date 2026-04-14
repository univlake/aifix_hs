<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nickname' => 'sometimes|required|string|max:100',
            'company_id' => 'sometimes|required|integer',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'status' => 'nullable|integer|in:1,2',
        ];
    }

    public function messages(): array
    {
        return [
            'nickname.required' => '不能为空',
            'nickname.string' => '必须是字符串',
            'nickname.max' => '不能超过100个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'phone.max' => '不能超过255个字符',
            'email.max' => '不能超过255个字符',
        ];
    }
}
