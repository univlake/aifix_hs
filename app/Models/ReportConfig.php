<?php

namespace App\Models;

class ReportConfig extends BaseModel
{
    protected $fillable = [
        'config_day',
        'type',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
