<?php

namespace App\Models;

class MeetingSignUp extends BaseModel
{
    protected $fillable = [
        'company_name',
        'name',
        'sex',
        'job_title',
        'tel',
        'card_number',
        'is_driving',
        'meeting_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
