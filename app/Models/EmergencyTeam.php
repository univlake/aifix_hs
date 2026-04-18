<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Collection;

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

    protected $appends = ['kids'];

    public function getKidsAttribute(): Collection
    {
        return $this->emergencyTeamKid;
    }

    public function emergencyTeamKid()
    {
        return $this->hasMany(EmergencyTeamKid::class, 'emergency_team_id');
    }
}
