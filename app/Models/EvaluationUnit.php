<?php

namespace App\Models;

class EvaluationUnit extends BaseModel
{
    protected $fillable = [
        'name',
        'is_qualification',
        'qualification_name',
        'qualification_annex_url',
        'evaluation_area',
        'contact',
        'contact_tel',
        'is_agreement',
        'agreement_annex_url',
        'supervision_url',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_qualification' => 'integer',
            'is_agreement' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }
}
