<?php

namespace App\Models;

class RiskLog extends BaseModel
{
    protected $fillable = [
        'type',
        'old_risk_num',
        'risk_num',
        'date',
        'content',
        'company_name',
        'old_risk_grade',
        'risk_grade',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
