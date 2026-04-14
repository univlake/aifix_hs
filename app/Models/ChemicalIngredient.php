<?php

namespace App\Models;

class ChemicalIngredient extends BaseModel
{
    protected $fillable = [
        'name',
        'content',
        'cas',
        'hazardous_chemical_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function hazardousChemical()
    {
        return $this->belongsTo(HazardousChemical::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
