<?php

namespace App\Models;

class TrainingFileLog extends BaseModel
{
    protected $fillable = [
        'training_file_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
