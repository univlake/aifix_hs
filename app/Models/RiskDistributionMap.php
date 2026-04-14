<?php

namespace App\Models;

class RiskDistributionMap extends BaseModel
{
    protected $fillable = [
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
