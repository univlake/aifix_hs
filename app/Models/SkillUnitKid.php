<?php

namespace App\Models;

class SkillUnitKid extends BaseModel
{
    protected $fillable = [
        'qualification_name',
        'qualification_annex_url',
        'skill_unit_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'skill_unit_id' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }
}
