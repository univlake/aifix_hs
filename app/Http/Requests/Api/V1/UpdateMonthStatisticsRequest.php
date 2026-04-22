<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMonthStatisticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|integer',
            'average_employee' => 'sometimes|nullable|integer|min:0',
            'safety_meeting_count' => 'sometimes|nullable|integer|min:0',
            'fire_meeting_count' => 'sometimes|nullable|integer|min:0',
            'safety_check_count' => 'sometimes|nullable|integer|min:0',
            'fire_check_count' => 'sometimes|nullable|integer|min:0',
            'safety_funding' => 'sometimes|nullable|numeric',
            'fire_funding' => 'sometimes|nullable|numeric',
            'hydrating_seedlings' => 'sometimes|nullable|integer|min:0',
            'retrofit_electrical' => 'sometimes|nullable|integer|min:0',
            'fire_extinguisher' => 'sometimes|nullable|integer|min:0',
            'smart_fire' => 'sometimes|nullable|integer|min:0',
            'safety_training_count' => 'sometimes|nullable|integer|min:0',
            'safety_training_number' => 'sometimes|nullable|integer|min:0',
            'new_people_training_number' => 'sometimes|nullable|integer|min:0',
            'fire_training_count' => 'sometimes|nullable|integer|min:0',
            'fire_training_number' => 'sometimes|nullable|integer|min:0',
            'safety_emergency_count' => 'sometimes|nullable|integer|min:0',
            'safety_emergency_number' => 'sometimes|nullable|integer|min:0',
            'fire_emergency_count' => 'sometimes|nullable|integer|min:0',
            'fire_emergency_number' => 'sometimes|nullable|integer|min:0',
            'some_hidden_danger' => 'sometimes|nullable|integer|min:0',
            'some_rectify_hidden_danger' => 'sometimes|nullable|integer|min:0',
            'no_rectify_info' => 'sometimes|nullable|string',
            'big_hidden_danger' => 'sometimes|nullable|integer|min:0',
            'big_rectify_hidden_danger' => 'sometimes|nullable|integer|min:0',
            'govern_hidden_danger_count' => 'sometimes|nullable|integer|min:0',
            'fire_fighting_danger' => 'sometimes|nullable|integer|min:0',
            'fire_fighting_hidden_danger' => 'sometimes|nullable|integer|min:0',
            'fire_fighting_hidden_danger_rectify' => 'sometimes|nullable|integer|min:0',
            'accident_bulletin_count' => 'sometimes|nullable|integer|min:0',
            'govern_hidden_danger' => 'sometimes|nullable|array',
            'govern_hidden_danger.*.govern_title' => 'nullable|string|max:255',
            'govern_hidden_danger.*.govern_supplies' => 'nullable|string',
            'govern_hidden_danger.*.govern_user' => 'nullable|string|max:128',
            'govern_hidden_danger.*.govern_date' => 'nullable|date',
            'govern_hidden_danger.*.govern_text' => 'nullable|string',
            'govern_hidden_danger.*.govern_money' => 'nullable|numeric',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.integer' => '必须是整数',
        ];
    }
}
