<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|integer',
            'old_risk_num' => 'nullable|numeric',
            'risk_num' => 'nullable|numeric',
            'date' => 'nullable|integer',
            'content' => 'nullable|string|max:255',
            'company_name' => 'nullable|string|max:255',
            'old_risk_grade' => 'nullable|string|max:255',
            'risk_grade' => 'nullable|string|max:255',
            'company_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'content.max' => '不能超过255个字符',
            'company_name.max' => '不能超过255个字符',
            'old_risk_grade.max' => '不能超过255个字符',
            'risk_grade.max' => '不能超过255个字符',
        ];
    }
}
