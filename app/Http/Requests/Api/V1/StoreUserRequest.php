<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => 'required|string|max:30|unique:users,username',
            'password' => 'required|string|min:6',
            'nickname' => 'required|string|max:100',
            'phone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'role' => 'nullable|string|exists:roles,name',
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => '不能为空',
            'username.string' => '必须是字符串',
            'username.max' => '不能超过30个字符',
            'username.unique' => '已存在',
            'password.required' => '不能为空',
            'password.string' => '必须是字符串',
            'password.min' => '不能小于6',
            'nickname.required' => '不能为空',
            'nickname.string' => '必须是字符串',
            'nickname.max' => '不能超过100个字符',
            'phone.max' => '不能超过255个字符',
            'email.max' => '不能超过255个字符',
        ];
    }
}
