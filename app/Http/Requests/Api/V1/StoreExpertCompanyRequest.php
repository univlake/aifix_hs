<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpertCompanyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_inspection_id' => 'required|integer',
            'check_company_id' => 'required|integer',
            'company_id' => 'required|integer',
            'notify_company_time' => 'nullable|date',
            'check_company_time' => 'nullable|date',
            'status' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            'expert_inspection_id.required' => '专家检查不能为空',
            'check_company_id.required' => '受检企业不能为空',
            'company_id.required' => '企业id不能为空',
        ];
    }
}
