<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreMeetingRequest extends FormRequest
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
            'meeting_date' => 'nullable|date',
            'sign_up_date' => 'nullable|date',
            'sign_end_date' => 'nullable|date',
            'alert_others' => 'nullable|string|max:255',
            'theme' => 'nullable|string|max:255',
            'place' => 'nullable|string|max:255',
            'summary' => 'nullable|string',
            'annex_url' => 'nullable|string',
            'summary_annex_url' => 'nullable|string',
            'sign_annex_url' => 'nullable|string',
            'material_annex_url' => 'nullable|string',
            'photo_annex_url' => 'nullable|string',
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
