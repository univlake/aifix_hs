<?php

namespace App\Models;

class FundingExecution extends BaseModel
{
    protected $appends = ['scale'];

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

    public function getScaleAttribute()
    {
        $investment = SecurityInvestment::find($this->security_investment_id);
        if ($investment && $investment->budget > 0) {
            return round($this->budget / $investment->budget * 100, 2).'%';
        }

        return '0%';
    }

    public function security_investment()
    {
        return $this->belongsTo(SecurityInvestment::class);
    }
}
