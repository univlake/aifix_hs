<?php

namespace App\Models;

class TrainingVideoLog extends BaseModel
{
    protected $fillable = [
        'training_video_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
