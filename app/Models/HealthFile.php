<?php

namespace App\Models;

class HealthFile extends BaseModel
{
    protected $fillable = [
        'name',
        'number',
        'department',
        'post',
        'checkup_date',
        'checkup_expiry',
        'review_situation',
        'handling_opinions',
        'process_result',
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
