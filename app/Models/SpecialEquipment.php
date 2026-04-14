<?php

namespace App\Models;

class SpecialEquipment extends BaseModel
{
    protected $fillable = [
        'equipment_name',
        'special_type_id',
        'utilized_location',
        'norm_model1',
        'norm_model2',
        'norm_model3',
        'norm_model4',
        'serial_number',
        'use_time',
        'valid_period',
        'inspect_unit',
        'maintain_info',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function specialType()
    {
        return $this->belongsTo(SpecialType::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
