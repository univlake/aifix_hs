<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SafetyManagement extends BaseModel
{
    protected $table = 'safety_management';

    protected $fillable = [
        'name',
        'safety_management_type_id',
        'tel',
        'cert_title',
        'cert_number',
        'valid_period',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'safety_management_type_id' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
            'valid_period' => 'date',
        ];
    }

    public function safetyManagementType(): BelongsTo
    {
        return $this->belongsTo(SafetyManagementType::class, 'safety_management_type_id');
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'company_id');
    }
}
