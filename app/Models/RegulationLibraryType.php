<?php

namespace App\Models;

class RegulationLibraryType extends BaseModel
{
    protected $fillable = [
        'title',
        'pid',
        'all_name',
        'sort',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
