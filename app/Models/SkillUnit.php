<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class SkillUnit extends BaseModel
{
    protected $fillable = [
        'name',
        'serving_type',
        'is_qualification',
        'evaluation_area',
        'contact',
        'contact_tel',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_qualification' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }

    public function kids(): HasMany
    {
        return $this->hasMany(SkillUnitKid::class, 'skill_unit_id');
    }
}
