<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreRiskMaxValueRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'security_officer_scale' => 'nullable|numeric',
            'already_obtain_people_scale' => 'nullable|numeric',
            'last_year_income_scale' => 'nullable|numeric',
            'acreage_scale' => 'nullable|numeric',
            'hazardous_processes_scale' => 'nullable|numeric',
            'hazardous_chemicals_scale' => 'nullable|numeric',
            'internal_meeting_scale' => 'nullable|numeric',
            'internal_training_scale' => 'nullable|numeric',
            'accident_bulletin_scale' => 'nullable|numeric',
            'emergency_team_scale' => 'nullable|numeric',
            'emergency_drill_scale' => 'nullable|numeric',
            'job_management_scale' => 'nullable|numeric',
            'health_checkup_scale' => 'nullable|numeric',
            'company_id' => 'nullable|integer',
        ];
    }

    public function messages(): array
    {
        return [
            // 无需自定义消息
        ];
    }
}
