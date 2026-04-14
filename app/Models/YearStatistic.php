<?php

namespace App\Models;

class YearStatistic extends BaseModel
{
    protected $fillable = [
        'company_name',
        'base_area',
        'enterprise_type',
        'safety_funding',
        'fire_fighting',
        'compliance_time',
        'revaluation_time',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function yearStatisticKid()
    {
        return $this->hasMany(YearStatisticKid::class, 'year_statistic_id');
    }
}
