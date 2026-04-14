<?php

namespace App\Models;

class TrainingVideo extends BaseModel
{
    protected $fillable = [
        'title',
        'introduce',
        'thumb_url',
        'video_url',
        'times_watched',
        'duration',
        'lector',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
