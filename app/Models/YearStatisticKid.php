<?php

namespace App\Models;

class YearStatisticKid extends BaseModel
{
    protected $fillable = [
        'name',
        'type',
        'should_obtain_people',
        'already_obtain_people',
        'no_obtain_people',
        'train_people',
        'year_statistic_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function yearStatistic()
    {
        return $this->belongsTo(YearStatistic::class, 'year_statistic_id');
    }
}
