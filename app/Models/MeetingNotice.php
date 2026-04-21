<?php

namespace App\Models;

class MeetingNotice extends BaseModel
{
    protected $fillable = [
        'company_name',
        'meeting_id',
        'company_id',
        'company_group_id',
        'company_group_name',
        'notify_time',
        'confirm_time',
        'user_id',
        'last_user_id',
    ];

    protected $casts = [
        'notify_time' => 'datetime',
        'confirm_time' => 'datetime',
    ];

    public function meeting()
    {
        return $this->belongsTo(Meeting::class, 'meeting_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
