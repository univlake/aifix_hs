<?php

namespace App\Models;

class EmergencyTeam extends BaseModel
{
    protected $fillable = [
        'name',
        'team_number',
        'save_user',
        'tel',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function emergencyTeamKid()
    {
        return $this->hasMany(EmergencyTeamKid::class, 'emergency_team_id');
    }
}
