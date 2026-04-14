<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMeetingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:255',
            'meeting_date' => 'sometimes|nullable|date',
            'sign_up_date' => 'sometimes|nullable|date',
            'sign_end_date' => 'sometimes|nullable|date',
            'alert_others' => 'sometimes|nullable|string|max:255',
            'theme' => 'sometimes|nullable|string|max:255',
            'place' => 'sometimes|nullable|string|max:255',
            'summary' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'summary_annex_url' => 'sometimes|nullable|string',
            'sign_annex_url' => 'sometimes|nullable|string',
            'material_annex_url' => 'sometimes|nullable|string',
            'photo_annex_url' => 'sometimes|nullable|string',
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
            'alert_others.max' => '不能超过255个字符',
            'theme.max' => '不能超过255个字符',
            'place.max' => '不能超过255个字符',
        ];
    }
}
