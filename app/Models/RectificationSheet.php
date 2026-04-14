<?php

namespace App\Models;

class RectificationSheet extends BaseModel
{
    protected $fillable = [
        'expert_inspection_id',
        'check_company_id',
        'sheet_name',
        'path',
        'user_id',
    ];
}
