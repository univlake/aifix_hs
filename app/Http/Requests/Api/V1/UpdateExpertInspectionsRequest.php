<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateExpertInspectionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer',
            'description' => 'sometimes|nullable|string',
            'comment' => 'sometimes|nullable|string',
            'start_date' => 'sometimes|nullable|date',
            'end_date' => 'sometimes|nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'title.required' => '不能为空',
            'title.string' => '必须是字符串',
            'title.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
