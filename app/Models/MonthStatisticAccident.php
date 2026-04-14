<?php

namespace App\Models;

class MonthStatisticAccident extends BaseModel
{
    protected $fillable = [
        'happen_time',
        'department',
        'name',
        'sex',
        'age',
        'work_type',
        'work_age',
        'education_level',
        'degree_injury',
        'type',
        'direct_cause',
        'content',
        'days_off',
        'direct_loss_property',
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
