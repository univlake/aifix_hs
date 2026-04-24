<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEmergencyDrillRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|nullable|string|max:255',
            'drill_time' => 'sometimes|nullable|date',
            'drill_local' => 'sometimes|nullable|string|max:255',
            'organization_department' => 'sometimes|nullable|string|max:255',
            'join_department' => 'sometimes|nullable|string|max:255',
            'drill_number' => 'sometimes|nullable|string|max:255',
            'drill_type' => 'sometimes|nullable|string|max:255',
            'drill_form' => 'sometimes|nullable|string|max:255',
            'drill_kind' => 'sometimes|nullable|string|max:255',
            'event' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'company_id.required' => '不能为空',
            'company_id.integer' => '必须是整数',
            'name.max' => '不能超过255个字符',
            'drill_local.max' => '不能超过255个字符',
            'organization_department.max' => '不能超过255个字符',
            'join_department.max' => '不能超过255个字符',
            'drill_number.max' => '不能超过255个字符',
            'drill_type.max' => '不能超过255个字符',
            'drill_form.max' => '不能超过255个字符',
            'drill_kind.max' => '不能超过255个字符',
        ];
    }
}
