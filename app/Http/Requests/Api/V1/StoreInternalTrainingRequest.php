<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreInternalTrainingRequest extends FormRequest
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
            'comment' => 'nullable|string',
            'object' => 'nullable|string|max:255',
            'number' => 'nullable|integer',
            'training_date' => 'nullable|date',
            'training_type' => 'nullable|string|max:255',
            'happening' => 'nullable|string',
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
            'name.max' => '不能超过255个字符',
            'object.max' => '不能超过255个字符',
            'training_type.max' => '不能超过255个字符',
        ];
    }
}
