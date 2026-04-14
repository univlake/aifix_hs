<?php

namespace App\Models;

class EmergencyTeamKid extends BaseModel
{
    protected $fillable = [
        'name',
        'department',
        'content',
        'tel',
        'emergency_team_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
