<?php

namespace App\Models;

class InformationDraft extends BaseModel
{
    protected $fillable = [
        'name',
        'company_name',
        'draft_department',
        'draft_others',
        'comment',
        'annex_url',
        'next_reviewer',
        'is_top',
        'status',
        'company_id',
        'user_id',
        'last_user_id',
    ];
}
