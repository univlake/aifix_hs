<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCertificateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|integer',
            'should_obtain_people' => 'nullable|integer',
            'already_obtain_people' => 'nullable|integer',
            'no_obtain_people' => 'nullable|string|max:255',
            'train_people' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'no_obtain_people.max' => '不能超过255个字符',
        ];
    }
}
