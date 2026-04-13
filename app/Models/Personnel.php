<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Personnel extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'total_people',
        'staff',
        'service',
        'manager',
        'high_school_diploma',
        'security_officer',
        'safety_engineer',
        'safety_engineering_major',
        'fire_engineer',
        'other',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'total_people' => 'integer',
            'staff' => 'integer',
            'service' => 'integer',
            'manager' => 'integer',
            'high_school_diploma' => 'integer',
            'security_officer' => 'integer',
            'safety_engineer' => 'integer',
            'safety_engineering_major' => 'integer',
            'fire_engineer' => 'integer',
            'other' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
