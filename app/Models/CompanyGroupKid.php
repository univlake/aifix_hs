<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class CompanyGroupKid extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'company_group_id',
        'company_id',
    ];

    protected function casts(): array
    {
        return [
            'company_group_id' => 'integer',
            'company_id' => 'integer',
        ];
    }
}
