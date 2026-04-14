<?php

namespace App\Models;

class Building extends BaseModel
{
    protected $fillable = [
        'title',
        'area',
        'fire_class',
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
        ];
    }
}
