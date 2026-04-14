<?php

namespace App\Models;

class OtherTraining extends BaseModel
{
    protected $fillable = [
        'name',
        'comment',
        'object',
        'number',
        'training_date',
        'task_content',
        'annex_url',
        'summary_annex_url',
        'sign_annex_url',
        'material_annex_url',
        'photo_annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
