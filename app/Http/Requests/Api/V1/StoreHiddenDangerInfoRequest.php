<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreHiddenDangerInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_inspection_id' => 'required|integer',
            'expert_company_id' => 'required|integer',
            'check_company_id' => 'nullable|integer',
            'area' => 'required|string|max:255',
            'session' => 'nullable|string|max:255',
            'description' => 'required|string',
            'hidden_type' => 'required|string|max:255',
            'hidden_level' => 'required|string|max:255',
            'legalises' => 'nullable|string',
            'proposal' => 'nullable|string',
            'correct_deadline' => 'nullable|date',
            'invest_status' => 'nullable|integer',
            'correct_status' => 'nullable|integer',
            'correct_date' => 'nullable|date',
            'review_description' => 'nullable|string',
            'review_user_id' => 'nullable|integer',
            'archive_user_id' => 'nullable|integer',
            'comment' => 'nullable|string',
            'company_id' => 'required|integer',
            'hiddenExamineAnnex' => 'nullable|array',
            'hiddenExamineAnnex.*.geolocation' => 'nullable|string',
            'hiddenExamineAnnex.*.annex_url' => 'nullable|string',
            'hiddenReviewAnnex' => 'nullable|array',
            'hiddenReviewAnnex.*.geolocation' => 'nullable|string',
            'hiddenReviewAnnex.*.annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'expert_inspection_id.required' => '不能为空',
            'expert_inspection_id.integer' => '必须是整数',
            'expert_company_id.required' => '不能为空',
            'expert_company_id.integer' => '必须是整数',
            'area.required' => '不能为空',
            'area.string' => '必须是字符串',
            'area.max' => '不能超过255个字符',
            'session.max' => '不能超过255个字符',
            'description.required' => '不能为空',
            'description.string' => '必须是字符串',
            'hidden_type.required' => '不能为空',
            'hidden_type.string' => '必须是字符串',
            'hidden_type.max' => '不能超过255个字符',
            'hidden_level.required' => '不能为空',
            'hidden_level.string' => '必须是字符串',
            'hidden_level.max' => '不能超过255个字符',
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
