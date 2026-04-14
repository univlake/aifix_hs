<?php

namespace App\Models;

class AccidentBulletin extends BaseModel
{
    protected $fillable = [
        'type',
        'direct_cause',
        'indirect_cause',
        'accident_level',
        'department',
        'happen_time',
        'happen_area',
        'content',
        'degree_injury',
        'direct_loss_property',
        'gauge_loss_property',
        'staff_die',
        'staff_hurt',
        'not_staff_die',
        'not_staff_hurt',
        'accident_report_url',
        'accident_photo_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function accidentBulletinKids()
    {
        return $this->hasMany(AccidentBulletinKid::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
