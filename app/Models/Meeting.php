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

    protected $casts = [
        'meeting_date' => 'datetime',
        'sign_up_date' => 'datetime',
        'sign_end_date' => 'datetime',
    ];

    public function meetingNotices()
    {
        return $this->hasMany(MeetingNotice::class);
    }

    // 向后兼容：保留旧别名
    public function meetingNotice()
    {
        return $this->hasMany(MeetingNotice::class);
    }

    public function meetingSignUps()
    {
        return $this->hasMany(MeetingSignUp::class, 'meeting_id');
    }

    public function company()
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
