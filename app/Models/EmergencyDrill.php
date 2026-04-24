<?php

namespace App\Models;

class EmergencyDrill extends BaseModel
{
    protected $fillable = [
        'name',
        'drill_time',
        'drill_local',
        'organization_department',
        'join_department',
        'drill_number',
        'drill_type',
        'drill_form',
        'drill_kind',
        'event',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
