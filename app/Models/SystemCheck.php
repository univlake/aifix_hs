<?php

namespace App\Models;

class SystemCheck extends BaseModel
{
    protected $fillable = [
        'number_v1',
        'number_v2',
        'number_v3',
        'number_v4',
        'number_v5',
        'number',
        'year',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
