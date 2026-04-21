<?php

namespace App\Models;

class NewNotifyScope extends BaseModel
{
    protected $fillable = [
        'company_name',
        'read_time',
        'read_status',
        'new_notify_id',
        'company_id',
        'company_group_name',
        'company_group_id',
        'user_id',
        'last_user_id',
    ];

    public function newNotify()
    {
        return $this->belongsTo(NewNotify::class);
    }
}
