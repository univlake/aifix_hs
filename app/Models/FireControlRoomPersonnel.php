<?php

namespace App\Models;

class FireControlRoomPersonnel extends BaseModel
{
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
            'valid_period' => 'date',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }
}
