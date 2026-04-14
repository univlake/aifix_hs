<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExternalTrainingRequest extends FormRequest
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
            'comment' => 'sometimes|nullable|string',
            'object' => 'sometimes|nullable|string|max:255',
            'number' => 'sometimes|nullable|integer',
            'training_date' => 'sometimes|nullable|date',
            'training_unit' => 'sometimes|nullable|string|max:255',
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
            'name.max' => '不能超过255个字符',
            'object.max' => '不能超过255个字符',
            'training_unit.max' => '不能超过255个字符',
        ];
    }
}
