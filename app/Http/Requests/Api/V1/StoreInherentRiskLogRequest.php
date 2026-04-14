<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreInherentRiskLogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'safety_architecture_value' => 'nullable|numeric',
            'security_officer_scale' => 'nullable|numeric',
            'already_obtain_people_scale' => 'nullable|numeric',
            'last_year_income_scale' => 'nullable|numeric',
            'funding_execution_scale' => 'nullable|numeric',
            'production_standardization_scale' => 'nullable|numeric',
            'health_system_scale' => 'nullable|numeric',
            'assess_detect_scale' => 'nullable|numeric',
            'high_school_diploma_scale' => 'nullable|numeric',
            'acreage_scale' => 'nullable|numeric',
            'staff_scale' => 'nullable|numeric',
            'safety_engineering_major_scale' => 'nullable|numeric',
            'hazardous_processes_scale' => 'nullable|numeric',
            'hazardous_process_scale' => 'nullable|numeric',
            'hazardous_process_more_scale' => 'nullable|numeric',
            'process_is_automatic_scale' => 'nullable|numeric',
            'special_equipment_number_scale' => 'nullable|numeric',
            'equipment_more_number_scale' => 'nullable|numeric',
            'hazardous_chemical_scale' => 'nullable|numeric',
            'hazardous_chemicals_number_scale' => 'nullable|numeric',
            'major_hazard_scale' => 'nullable|numeric',
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
