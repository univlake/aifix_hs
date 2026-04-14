<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|nullable|integer',
            'old_risk_num' => 'sometimes|nullable|numeric',
            'risk_num' => 'sometimes|nullable|numeric',
            'date' => 'sometimes|nullable|integer',
            'content' => 'sometimes|nullable|string|max:255',
            'company_name' => 'sometimes|nullable|string|max:255',
            'old_risk_grade' => 'sometimes|nullable|string|max:255',
            'risk_grade' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|nullable|integer',
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
