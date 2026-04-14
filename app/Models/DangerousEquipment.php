<?php

namespace App\Models;

class DangerousEquipment extends BaseModel
{
    protected $fillable = [
        'equipment_name',
        'utilized_location',
        'norm_model',
        'serial_number',
        'use_time',
        'automation_type',
        'maintain_info',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
