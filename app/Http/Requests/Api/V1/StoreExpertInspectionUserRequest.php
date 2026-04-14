<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreExpertInspectionUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_user_id' => 'required|integer',
            'expert_company_id' => 'required|integer',
            'company_id' => 'required|integer',
            'status' => 'nullable|integer',
            'comment' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'expert_user_id.required' => '专家用户不能为空',
            'expert_company_id.required' => '专家检查企业不能为空',
            'company_id.required' => '企业id不能为空',
        ];
    }
}
