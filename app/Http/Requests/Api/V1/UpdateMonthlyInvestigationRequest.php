<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMonthlyInvestigationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'sometimes|nullable|string|max:255',
            'is_fire_fighting' => 'sometimes|nullable|integer',
            'is_emergency' => 'sometimes|nullable|integer',
            'content' => 'sometimes|nullable|string',
            'inv_time' => 'sometimes|nullable|date',
            'inv_name' => 'sometimes|nullable|string|max:255',
            'level' => 'sometimes|nullable|string|max:255',
            'proposal' => 'sometimes|nullable|string',
            'legalbasis' => 'sometimes|nullable|string',
            'correct_date' => 'sometimes|nullable|date',
            'review_discription' => 'sometimes|nullable|string',
            'review_date' => 'sometimes|nullable|date',
            'review_content' => 'sometimes|nullable|string',
            'review_user' => 'sometimes|nullable|string|max:255',
            'correct_result' => 'sometimes|nullable|string|max:255',
            'is_govern' => 'sometimes|nullable|integer',
            'govern_title' => 'sometimes|nullable|string|max:255',
            'govern_supplies' => 'sometimes|nullable|string|max:255',
            'govern_user' => 'sometimes|nullable|string|max:255',
            'govern_date' => 'sometimes|nullable|string|max:255',
            'govern_text' => 'sometimes|nullable|string|max:255',
            'govern_money' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|nullable|integer',
            'monthlyInvestigationReviews' => 'nullable|array',
            'monthlyInvestigationReviews.*.annex_url' => 'nullable|string',
            'monthlyInvestigationViews' => 'nullable|array',
            'monthlyInvestigationViews.*.annex_url' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'type.max' => '不能超过255个字符',
            'inv_name.max' => '不能超过255个字符',
            'level.max' => '不能超过255个字符',
            'review_user.max' => '不能超过255个字符',
            'correct_result.max' => '不能超过255个字符',
            'govern_title.max' => '不能超过255个字符',
            'govern_supplies.max' => '不能超过255个字符',
            'govern_user.max' => '不能超过255个字符',
            'govern_date.max' => '不能超过255个字符',
            'govern_text.max' => '不能超过255个字符',
            'govern_money.max' => '不能超过255个字符',
        ];
    }
}
