<?php

namespace App\Models;

class MajorHazardousProcess extends BaseModel
{
    protected $fillable = [
        'name',
        'dangerous_craft_type_id',
        'position',
        'hazardous_chemical_id',
        'dangerous_equipment_id',
        'operating_people_num',
        'temperature',
        'pressure',
        'pressure_unit',
        'is_sis',
        'sil_level',
        'detect_parameter',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function dangerousCraftType()
    {
        return $this->belongsTo(DangerousCraftType::class);
    }

    public function hazardousChemical()
    {
        return $this->belongsTo(HazardousChemical::class);
    }

    public function dangerousEquipment()
    {
        return $this->belongsTo(DangerousEquipment::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
