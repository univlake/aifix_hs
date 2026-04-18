<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInternalMeetingRequest extends FormRequest
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
            'theme' => 'sometimes|nullable|string|max:255',
            'type' => 'sometimes|nullable|in:fire,safety',
            'meeting_date' => 'sometimes|nullable|date',
            'summary' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'notice_annex_url' => 'sometimes|nullable|string',
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
            'theme.max' => '不能超过255个字符',
            'type.in' => '会议类型必须是 fire 或 safety',
        ];
    }
}
