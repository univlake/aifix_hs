<?php

namespace App\Models;

class SpecialEquipmentStaff extends BaseModel
{
    protected $fillable = [
        'name',
        'cert_title',
        'cert_number',
        'valid_period',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
