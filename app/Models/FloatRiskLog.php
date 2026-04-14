<?php

namespace App\Models;

class FloatRiskLog extends BaseModel
{
    protected $fillable = [
        'internal_meeting_scale',
        'internal_training_scale',
        'accident_bulletin_scale',
        'accident_bulletin_severe_scale',
        'accident_report_url_scale',
        'emergency_team_scale',
        'emergency_drill_scale',
        'job_management_scale',
        'risk_source_scale',
        'monthly_investigation_scale',
        'three_together_over_scale',
        'unit_sum_number_scale',
        'evaluation_unit_scale',
        'evaluation_unit_school_scale',
        'health_checkup_people_scale',
        'health_checkup_scale',
        'health_report_scale',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
