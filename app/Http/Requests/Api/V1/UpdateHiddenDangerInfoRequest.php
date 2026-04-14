<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateHiddenDangerInfoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'expert_inspection_id' => 'sometimes|nullable|integer',
            'expert_company_id' => 'sometimes|nullable|integer',
            'check_company_id' => 'sometimes|nullable|integer',
            'area' => 'sometimes|nullable|string|max:255',
            'session' => 'sometimes|nullable|string|max:255',
            'description' => 'sometimes|nullable|string',
            'hidden_type' => 'sometimes|nullable|string|max:255',
            'hidden_level' => 'sometimes|nullable|string|max:255',
            'legalises' => 'sometimes|nullable|string',
            'proposal' => 'sometimes|nullable|string',
            'correct_deadline' => 'sometimes|nullable|date',
            'invest_status' => 'sometimes|nullable|integer',
            'zg_user_id' => 'sometimes|nullable|integer',
            'correct_status' => 'sometimes|nullable|integer',
            'correct_date' => 'sometimes|nullable|date',
            'review_description' => 'sometimes|nullable|string',
            'review_user_id' => 'sometimes|nullable|integer',
            'review_time' => 'sometimes|nullable|date',
            'archive_user_id' => 'sometimes|nullable|integer',
            'comment' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|nullable|integer',
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
            'area.max' => '不能超过255个字符',
            'session.max' => '不能超过255个字符',
            'hidden_type.max' => '不能超过255个字符',
            'hidden_level.max' => '不能超过255个字符',
        ];
    }
}
