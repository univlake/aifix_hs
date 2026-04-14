<?php

namespace App\Models;

class EliminationControlStaff extends BaseModel
{
    protected $table = 'elimination_control_staff';

    protected $fillable = [
        'name',
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
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
            'valid_period' => 'date',
        ];
    }
}
