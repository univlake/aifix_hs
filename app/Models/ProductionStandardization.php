<?php

namespace App\Models;

class ProductionStandardization extends BaseModel
{
    protected $fillable = [
        'grade',
        'get_time',
        'valid_period',
        'annex_url',
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
            'get_time' => 'date',
            'valid_period' => 'date',
        ];
    }
}
