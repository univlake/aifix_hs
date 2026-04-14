<?php

namespace App\Models;

class NormCheck extends BaseModel
{
    protected $fillable = [
        'path',
        'number',
        'year',
        'type',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
