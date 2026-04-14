<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreChangeManageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'department_name' => 'nullable|string|max:255',
            'apply_date' => 'nullable|date',
            'reason' => 'nullable|string',
            'apply_leader_opinion' => 'nullable|string',
            'apply_leader_opinion_date' => 'nullable|date',
            'risk_analyze' => 'nullable|string',
            'manage_leader_opinion' => 'nullable|string',
            'manage_leader_opinion_date' => 'nullable|date',
            'approve' => 'nullable|string',
            'approve_date' => 'nullable|date',
            'acceptance_info' => 'nullable|string',
            'acceptance_info_date' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'title.max' => '不能超过255个字符',
            'department_name.max' => '不能超过255个字符',
        ];
    }
}
