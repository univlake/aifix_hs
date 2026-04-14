<?php

namespace App\Models;

class OfficeNotifyScope extends BaseModel
{
    protected $fillable = [
        'company_name',
        'feedback_time',
        'feedback_status',
        'feedback_annex_url',
        'office_notify_id',
        'company_id',
        'company_group_name',
        'company_group_id',
        'user_id',
        'last_user_id',
    ];
}
