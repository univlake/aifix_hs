<?php

namespace App\Models;

class DailyCheck extends BaseModel
{
    protected $fillable = [
        'daily_check_template_id',
        'path',
        'number',
        'comment',
        'status',
        'company_id',
        'year',
        'user_id',
        'last_user_id',
    ];

    protected $casts = [
        'status' => 'integer',
        'number' => 'decimal:1',
        'year' => 'integer',
        'company_id' => 'integer',
    ];

    public function dailyCheckTemplate()
    {
        return $this->belongsTo(DailyCheckTemplate::class, 'daily_check_template_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
