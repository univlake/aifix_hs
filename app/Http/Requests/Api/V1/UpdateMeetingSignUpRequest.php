<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeetingSignUpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'meeting_id' => 'sometimes|required|integer',
            'company_name' => 'sometimes|nullable|string|max:255',
            'name' => 'sometimes|nullable|string|max:255',
            'sex' => 'sometimes|nullable|string|max:10',
            'job_title' => 'sometimes|nullable|string|max:255',
            'tel' => 'sometimes|nullable|string|max:255',
            'card_number' => 'sometimes|nullable|string|max:255',
            'is_driving' => 'sometimes|nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'meeting_id.required' => '不能为空',
            'meeting_id.integer' => '必须是整数',
            'company_name.max' => '不能超过255个字符',
            'name.max' => '不能超过255个字符',
            'sex.max' => '不能超过10个字符',
            'job_title.max' => '不能超过255个字符',
            'tel.max' => '不能超过255个字符',
            'card_number.max' => '不能超过255个字符',
            'is_driving.max' => '不能超过255个字符',
        ];
    }
}
