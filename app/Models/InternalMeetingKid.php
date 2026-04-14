<?php

namespace App\Models;

class InternalMeetingKid extends BaseModel
{
    protected $fillable = [
        'internal_meeting_id',
        'join_user_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function join_user()
    {
        return $this->belongsTo(User::class, 'join_user_id');
    }
}
