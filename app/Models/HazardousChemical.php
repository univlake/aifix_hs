<?php

namespace App\Models;

class HazardousChemical extends BaseModel
{
    protected $fillable = [
        'name',
        'alias',
        'is_supervision',
        'is_toxin',
        'is_explosion',
        'is_easy_explode',
        'is_narcotics',
        'is_monitor',
        'is_mixing',
        'cas',
        'position',
        'temperature',
        'storage',
        'storage_unit',
        'year_use',
        'year_use_unit',
        'pressure',
        'pressure_unit',
        'fire_class',
        'matter_state',
        'msds',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function chemicalIngredients()
    {
        return $this->hasMany(ChemicalIngredient::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
