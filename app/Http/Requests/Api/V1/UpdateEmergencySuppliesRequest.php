<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmergencySuppliesRequest extends FormRequest
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
            'number' => 'sometimes|nullable|string|max:255',
            'save_user' => 'sometimes|nullable|string|max:255',
            'tel' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'number.max' => '不能超过255个字符',
            'save_user.max' => '不能超过255个字符',
            'tel.max' => '不能超过255个字符',
        ];
    }
}
