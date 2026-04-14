<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRiskMaxValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'security_officer_scale' => 'sometimes|nullable|numeric',
            'already_obtain_people_scale' => 'sometimes|nullable|numeric',
            'last_year_income_scale' => 'sometimes|nullable|numeric',
            'acreage_scale' => 'sometimes|nullable|numeric',
            'hazardous_processes_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemicals_scale' => 'sometimes|nullable|numeric',
            'internal_meeting_scale' => 'sometimes|nullable|numeric',
            'internal_training_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_scale' => 'sometimes|nullable|numeric',
            'emergency_team_scale' => 'sometimes|nullable|numeric',
            'emergency_drill_scale' => 'sometimes|nullable|numeric',
            'job_management_scale' => 'sometimes|nullable|numeric',
            'health_checkup_scale' => 'sometimes|nullable|numeric',
            'company_id' => 'sometimes|nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            // 无需自定义消息
        ];
    }
}
