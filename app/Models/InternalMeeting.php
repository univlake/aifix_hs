<?php

namespace App\Models;

class InternalMeeting extends BaseModel
{
    protected $fillable = [
        'name',
        'theme',
        'type',
        'meeting_date',
        'summary',
        'annex_url',
        'notice_annex_url',
        'summary_annex_url',
        'sign_annex_url',
        'material_annex_url',
        'photo_annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function internalMeetingKid()
    {
        return $this->hasMany(InternalMeetingKid::class);
    }
}
