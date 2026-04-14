<?php

namespace App\Models;

class MajorHazard extends BaseModel
{
    protected $fillable = [
        'name',
        'level',
        'position',
        'r_value',
        'is_sis',
        'sil_level',
        'detect_parameter',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function majorConstitutes()
    {
        return $this->hasMany(MajorConstitute::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
