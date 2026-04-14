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
        'user_id',
        'last_user_id',
    ];
}
