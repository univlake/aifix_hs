<?php

namespace App\Models;

class EmergencySupplies extends BaseModel
{
    protected $fillable = [
        'name',
        'number',
        'save_user',
        'tel',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
