<?php

namespace App\Models;

class ExternalTraining extends BaseModel
{
    protected $fillable = [
        'name',
        'comment',
        'object',
        'number',
        'training_date',
        'training_unit',
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
