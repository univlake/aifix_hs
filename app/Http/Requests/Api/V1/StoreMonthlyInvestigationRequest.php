<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreMonthlyInvestigationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => 'nullable|string|max:255',
            'is_fire_fighting' => 'nullable|integer',
            'is_emergency' => 'nullable|integer',
            'content' => 'nullable|string',
            'inv_time' => 'nullable|date',
            'inv_name' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:255',
            'proposal' => 'nullable|string',
            'legalbasis' => 'nullable|string',
            'correct_date' => 'nullable|date',
            'review_discription' => 'nullable|string',
            'review_date' => 'nullable|date',
            'review_content' => 'nullable|string',
            'review_user' => 'nullable|string|max:255',
            'correct_result' => 'nullable|string|max:255',
            'is_govern' => 'nullable|integer',
            'govern_title' => 'nullable|string|max:255',
            'govern_supplies' => 'nullable|string|max:255',
            'govern_user' => 'nullable|string|max:255',
            'govern_date' => 'nullable|string|max:255',
            'govern_text' => 'nullable|string|max:255',
            'govern_money' => 'nullable|string|max:255',
            'company_id' => 'required|integer',
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
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
        ];
    }
}
