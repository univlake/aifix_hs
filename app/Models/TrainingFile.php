<?php

namespace App\Models;

class TrainingFile extends BaseModel
{
    protected $fillable = [
        'title',
        'file_url',
        'times_download',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
