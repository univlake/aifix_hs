<?php

namespace App\Models;

class HealthReport extends BaseModel
{
    protected $fillable = [
        'find_date',
        'name',
        'post',
        'type',
        'is_true',
        'mechanism',
        'identify_date',
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
