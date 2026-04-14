<?php

namespace App\Models;

class MonthStatisticControl extends BaseModel
{
    protected $fillable = [
        'govern_title',
        'govern_supplies',
        'govern_user',
        'govern_date',
        'govern_text',
        'govern_money',
        'month_statistic_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function monthStatistic()
    {
        return $this->belongsTo(MonthStatistic::class, 'month_statistic_id');
    }
}
