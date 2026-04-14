<?php

namespace App\Models;

class HazardousProcess extends BaseModel
{
    protected $fillable = [
        'process_type_id',
        'position',
        'hazardous_chemical_id',
        'dangerous_equipment_id',
        'other_equipment_name',
        'operating_people_num',
        'is_online_test',
        'is_automatic',
        'is_control',
        'is_dust',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function processType()
    {
        return $this->belongsTo(ProcessType::class);
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
