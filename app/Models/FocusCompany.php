<?php

namespace App\Models;

class FocusCompany extends BaseModel
{
    protected $fillable = [
        'focus_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class, 'focus_id');
    }
}
