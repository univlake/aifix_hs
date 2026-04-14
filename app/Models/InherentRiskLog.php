<?php

namespace App\Models;

class InherentRiskLog extends BaseModel
{
    protected $fillable = [
        'safety_architecture_value',
        'security_officer_scale',
        'already_obtain_people_scale',
        'last_year_income_scale',
        'funding_execution_scale',
        'production_standardization_scale',
        'health_system_scale',
        'assess_detect_scale',
        'high_school_diploma_scale',
        'acreage_scale',
        'staff_scale',
        'safety_engineering_major_scale',
        'hazardous_processes_scale',
        'hazardous_process_scale',
        'hazardous_process_more_scale',
        'process_is_automatic_scale',
        'special_equipment_number_scale',
        'equipment_more_number_scale',
        'hazardous_chemical_scale',
        'hazardous_chemicals_number_scale',
        'major_hazard_scale',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
