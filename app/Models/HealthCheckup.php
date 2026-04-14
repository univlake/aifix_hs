<?php

namespace App\Models;

class HealthCheckup extends BaseModel
{
    protected $fillable = [
        'type',
        'department',
        'number',
        'checkup_date',
        'checkup_expiry',
        'measure',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
