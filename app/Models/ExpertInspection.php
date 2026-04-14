<?php

namespace App\Models;

class ExpertInspection extends BaseModel
{
    protected $fillable = [
        'title',
        'description',
        'comment',
        'start_date',
        'end_date',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function expertCompanies()
    {
        return $this->hasMany(ExpertCompany::class);
    }
}
