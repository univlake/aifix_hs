<?php

namespace App\Models;

class FireFacility extends BaseModel
{
    protected $fillable = [
        'equipment_name',
        'utilized_location',
        'special_type',
        'use_time',
        'automation_type',
        'maintain_info',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
