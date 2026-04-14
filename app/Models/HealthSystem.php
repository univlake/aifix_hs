<?php

namespace App\Models;

class HealthSystem extends BaseModel
{
    protected $fillable = [
        'certification_time',
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
