<?php

namespace App\Models;

class TrainingClassInfo extends BaseModel
{
    protected $fillable = [
        'title',
        'introduce',
        'thumb_url',
        'video_url',
        'times_watched',
        'duration',
        'lector',
        'training_class_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
