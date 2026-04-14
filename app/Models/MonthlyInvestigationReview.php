<?php

namespace App\Models;

class MonthlyInvestigationReview extends BaseModel
{
    protected $fillable = [
        'monthly_investigation_id',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
