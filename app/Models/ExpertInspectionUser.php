<?php

namespace App\Models;

class ExpertInspectionUser extends BaseModel
{
    protected $fillable = [
        'expert_user_id',
        'expert_company_id',
        'status',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function expertCompany()
    {
        return $this->belongsTo(ExpertCompany::class, 'expert_company_id');
    }
}
