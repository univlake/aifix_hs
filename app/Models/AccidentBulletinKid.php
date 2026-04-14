<?php

namespace App\Models;

class AccidentBulletinKid extends BaseModel
{
    protected $fillable = [
        'name',
        'degree_injury',
        'department',
        'age',
        'sex',
        'work_type',
        'work_age',
        'education_level',
        'days_off',
        'accident_bulletin_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function accidentBulletin()
    {
        return $this->belongsTo(AccidentBulletin::class, 'accident_bulletin_id');
    }
}
