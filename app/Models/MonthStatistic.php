<?php

namespace App\Models;

class MonthStatistic extends BaseModel
{
    protected $fillable = [
        'average_employee',
        'safety_meeting_count',
        'fire_meeting_count',
        'safety_check_count',
        'fire_check_count',
        'safety_funding',
        'fire_funding',
        'hydrating_seedlings',
        'retrofit_electrical',
        'fire_extinguisher',
        'smart_fire',
        'safety_training_count',
        'safety_training_number',
        'new_people_training_number',
        'fire_training_count',
        'fire_training_number',
        'safety_emergency_count',
        'safety_emergency_number',
        'fire_emergency_count',
        'fire_emergency_number',
        'some_hidden_danger',
        'some_rectify_hidden_danger',
        'no_rectify_info',
        'big_hidden_danger',
        'big_rectify_hidden_danger',
        'govern_hidden_danger_count',
        'fire_fighting_danger',
        'fire_fighting_hidden_danger',
        'fire_fighting_hidden_danger_rectify',
        'accident_bulletin_count',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function monthStatisticAccident()
    {
        return $this->hasMany(MonthStatisticAccident::class, 'month_statistic_id');
    }

    public function monthStatisticControl()
    {
        return $this->hasMany(MonthStatisticControl::class, 'month_statistic_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
