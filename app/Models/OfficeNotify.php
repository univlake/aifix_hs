<?php

namespace App\Models;

class OfficeNotify extends BaseModel
{
    protected $fillable = [
        'name',
        'feedback_time',
        'alert_others',
        'comment',
        'annex_url',
        'excel_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function officeNotifyScope()
    {
        return $this->hasMany(OfficeNotifyScope::class);
    }
}
