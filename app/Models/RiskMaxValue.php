<?php

namespace App\Models;

class RiskMaxValue extends BaseModel
{
    protected $fillable = [
        'security_officer_scale',
        'already_obtain_people_scale',
        'last_year_income_scale',
        'acreage_scale',
        'hazardous_processes_scale',
        'hazardous_chemicals_scale',
        'internal_meeting_scale',
        'internal_training_scale',
        'emergency_team_scale',
        'emergency_drill_scale',
        'accident_bulletin_scale',
        'job_management_scale',
        'health_checkup_scale',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
