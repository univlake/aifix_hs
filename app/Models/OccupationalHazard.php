<?php

namespace App\Models;

class OccupationalHazard extends BaseModel
{
    protected $fillable = [
        'name',
        'type',
        'number',
        'is_declare',
        'declare_date',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
