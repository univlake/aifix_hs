<?php

namespace App\Models;

class NewNotify extends BaseModel
{
    protected $fillable = [
        'name',
        'alert_others',
        'comment',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function newNotifyScope()
    {
        return $this->hasMany(NewNotifyScope::class);
    }
}
