<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFloatRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internal_meeting_scale' => 'nullable|numeric',
            'internal_training_scale' => 'nullable|numeric',
            'accident_bulletin_scale' => 'nullable|numeric',
            'accident_bulletin_severe_scale' => 'nullable|numeric',
            'accident_report_url_scale' => 'nullable|numeric',
            'emergency_team_scale' => 'nullable|numeric',
            'emergency_drill_scale' => 'nullable|numeric',
            'job_management_scale' => 'nullable|numeric',
            'risk_source_scale' => 'nullable|numeric',
            'monthly_investigation_scale' => 'nullable|numeric',
            'three_together_over_scale' => 'nullable|numeric',
            'unit_sum_number_scale' => 'nullable|numeric',
            'evaluation_unit_scale' => 'nullable|numeric',
            'evaluation_unit_school_scale' => 'nullable|numeric',
            'health_checkup_people_scale' => 'nullable|numeric',
            'health_checkup_scale' => 'nullable|numeric',
            'health_report_scale' => 'nullable|numeric',
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
