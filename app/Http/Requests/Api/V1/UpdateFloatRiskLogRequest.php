<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateFloatRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'internal_meeting_scale' => 'sometimes|nullable|numeric',
            'internal_training_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_scale' => 'sometimes|nullable|numeric',
            'accident_bulletin_severe_scale' => 'sometimes|nullable|numeric',
            'accident_report_url_scale' => 'sometimes|nullable|numeric',
            'emergency_team_scale' => 'sometimes|nullable|numeric',
            'emergency_drill_scale' => 'sometimes|nullable|numeric',
            'job_management_scale' => 'sometimes|nullable|numeric',
            'risk_source_scale' => 'sometimes|nullable|numeric',
            'monthly_investigation_scale' => 'sometimes|nullable|numeric',
            'three_together_over_scale' => 'sometimes|nullable|numeric',
            'unit_sum_number_scale' => 'sometimes|nullable|numeric',
            'evaluation_unit_scale' => 'sometimes|nullable|numeric',
            'evaluation_unit_school_scale' => 'sometimes|nullable|numeric',
            'health_checkup_people_scale' => 'sometimes|nullable|numeric',
            'health_checkup_scale' => 'sometimes|nullable|numeric',
            'health_report_scale' => 'sometimes|nullable|numeric',
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
