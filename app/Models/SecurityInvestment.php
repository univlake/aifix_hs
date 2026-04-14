<?php

namespace App\Models;

class SecurityInvestment extends BaseModel
{
    protected $appends = ['scale'];

    protected $fillable = [
        'year',
        'type',
        'title',
        'content',
        'budget',
        'last_year_income',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function getScaleAttribute()
    {
        if ($this->last_year_income && $this->last_year_income > 0) {
            return round($this->budget / $this->last_year_income * 100, 2) . '%';
        }
        return '0%';
    }
}
