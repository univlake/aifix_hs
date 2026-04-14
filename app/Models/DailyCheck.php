<?php

namespace App\Models;

class DailyCheck extends BaseModel
{
    protected $fillable = [
        'daily_check_template_id',
        'path',
        'number',
        'comment',
        'company_id',
        'year',
        'user_id',
        'last_user_id',
    ];

    public function dailyCheckTemplate()
    {
        return $this->belongsTo(DailyCheckTemplate::class, 'daily_check_template_id');
    }
}
