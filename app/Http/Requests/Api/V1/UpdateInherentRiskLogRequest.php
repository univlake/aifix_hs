<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UpdateInherentRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'safety_architecture_value' => 'sometimes|nullable|numeric',
            'security_officer_scale' => 'sometimes|nullable|numeric',
            'already_obtain_people_scale' => 'sometimes|nullable|numeric',
            'last_year_income_scale' => 'sometimes|nullable|numeric',
            'funding_execution_scale' => 'sometimes|nullable|numeric',
            'production_standardization_scale' => 'sometimes|nullable|numeric',
            'health_system_scale' => 'sometimes|nullable|numeric',
            'assess_detect_scale' => 'sometimes|nullable|numeric',
            'high_school_diploma_scale' => 'sometimes|nullable|numeric',
            'acreage_scale' => 'sometimes|nullable|numeric',
            'staff_scale' => 'sometimes|nullable|numeric',
            'safety_engineering_major_scale' => 'sometimes|nullable|numeric',
            'hazardous_processes_scale' => 'sometimes|nullable|numeric',
            'hazardous_process_scale' => 'sometimes|nullable|numeric',
            'hazardous_process_more_scale' => 'sometimes|nullable|numeric',
            'process_is_automatic_scale' => 'sometimes|nullable|numeric',
            'special_equipment_number_scale' => 'sometimes|nullable|numeric',
            'equipment_more_number_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemical_scale' => 'sometimes|nullable|numeric',
            'hazardous_chemicals_number_scale' => 'sometimes|nullable|numeric',
            'major_hazard_scale' => 'sometimes|nullable|numeric',
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
