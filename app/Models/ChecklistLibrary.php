<?php

namespace App\Models;

class ChecklistLibrary extends BaseModel
{
    protected $fillable = [
        'title',
        'status',
        'preview_annex_url',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
