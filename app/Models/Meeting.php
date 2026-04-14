<?php

namespace App\Models;

class Meeting extends BaseModel
{
    protected $fillable = [
        'name',
        'meeting_date',
        'sign_up_date',
        'sign_end_date',
        'theme',
        'place',
        'summary',
        'alert_others',
        'annex_url',
        'summary_annex_url',
        'sign_annex_url',
        'material_annex_url',
        'photo_annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function meetingNotice()
    {
        return $this->hasMany(MeetingNotice::class);
    }

    public function meetingSignUps()
    {
        return $this->hasMany(MeetingSignUp::class, 'meeting_id');
    }
}
