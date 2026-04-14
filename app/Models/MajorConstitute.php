<?php

namespace App\Models;

class MajorConstitute extends BaseModel
{
    protected $fillable = [
        'name',
        'hazardous_chemical_id',
        'number',
        'major_hazard_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function majorHazard()
    {
        return $this->belongsTo(MajorHazard::class);
    }

    public function hazardousChemical()
    {
        return $this->belongsTo(HazardousChemical::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
