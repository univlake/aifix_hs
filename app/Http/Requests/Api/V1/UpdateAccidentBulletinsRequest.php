<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAccidentBulletinsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|integer',
            'type' => ['sometimes', 'nullable', Rule::in(StoreAccidentBulletinsRequest::TYPES)],
            'direct_cause' => ['sometimes', 'nullable', Rule::in(StoreAccidentBulletinsRequest::DIRECT_CAUSES)],
            'indirect_cause' => ['sometimes', 'nullable', Rule::in(StoreAccidentBulletinsRequest::INDIRECT_CAUSES)],
            'accident_level' => ['sometimes', 'nullable', Rule::in(StoreAccidentBulletinsRequest::ACCIDENT_LEVELS)],
            'degree_injury' => ['sometimes', 'nullable', Rule::in(StoreAccidentBulletinsRequest::DEGREE_INJURIES)],
            'department' => 'sometimes|nullable|string|max:255',
            'happen_time' => 'sometimes|nullable|date',
            'happen_area' => 'sometimes|nullable|string|max:255',
            'content' => 'sometimes|nullable|string',
            'direct_loss_property' => 'sometimes|nullable|string|max:64',
            'gauge_loss_property' => 'sometimes|nullable|string|max:64',
            'staff_die' => 'sometimes|nullable|integer|min:0',
            'staff_hurt' => 'sometimes|nullable|integer|min:0',
            'not_staff_die' => 'sometimes|nullable|integer|min:0',
            'not_staff_hurt' => 'sometimes|nullable|integer|min:0',
            'accident_report_url' => 'sometimes|nullable|string',
            'accident_photo_url' => 'sometimes|nullable|string',
            'kids' => 'sometimes|nullable|array',
            'kids.*.name' => 'nullable|string|max:64',
            'kids.*.degree_injury' => 'nullable|string|max:64',
            'kids.*.department' => 'nullable|string|max:128',
            'kids.*.age' => 'nullable|integer|min:0|max:150',
            'kids.*.sex' => 'nullable|string|max:8',
            'kids.*.work_type' => 'nullable|string|max:64',
            'kids.*.work_age' => 'nullable|integer|min:0|max:100',
            'kids.*.education_level' => 'nullable|string|max:64',
            'kids.*.days_off' => 'nullable|integer|min:0',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.integer' => '必须是整数',
            'type.in' => '事故类型取值不合法',
            'direct_cause.in' => '直接原因取值不合法',
            'indirect_cause.in' => '间接原因取值不合法',
            'accident_level.in' => '事故等级取值不合法',
            'degree_injury.in' => '伤亡程度取值不合法',
        ];
    }
}
