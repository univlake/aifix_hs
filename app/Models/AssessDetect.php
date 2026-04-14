<?php

namespace App\Models;

class AssessDetect extends BaseModel
{
    protected $fillable = [
        'name', 'assess_detect_type', 'skill_unit_id', 'skill_unit_kid_id',
        'valid_period', 'annex_url', 'company_id', 'user_id', 'last_user_id',
    ];

    public function skillUnit()
    {
        return $this->belongsTo(SkillUnit::class);
    }

    public function skillUnitKid()
    {
        return $this->belongsTo(SkillUnitKid::class);
    }
}
