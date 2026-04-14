<?php

namespace App\Models;

class TrainingClass extends BaseModel
{
    protected $fillable = [
        'title',
        'introduce',
        'thumb_url',
        'grade',
        'class_hours',
        'training_class_type_id',
        'user_id',
        'last_user_id',
    ];
}
