<?php

namespace App\Models;

class DesignUnit extends BaseModel
{
    protected $fillable = [
        'name',
        'qualification_name',
        'contact',
        'contact_tel',
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
        ];
    }
}
