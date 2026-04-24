<?php

namespace App\Models;

class FundingExecution extends BaseModel
{
    protected $fillable = [
        'year',
        'security_investment_id',
        'simple_content',
        'content',
        'budget',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function security_investment()
    {
        return $this->belongsTo(SecurityInvestment::class);
    }
}
