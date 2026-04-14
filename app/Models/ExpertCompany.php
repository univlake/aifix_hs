<?php

namespace App\Models;

class ExpertCompany extends BaseModel
{
    protected $fillable = [
        'expert_inspection_id',
        'check_company_id',
        'notify_company_time',
        'check_company_time',
        'status',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function expertInspection()
    {
        return $this->belongsTo(ExpertInspection::class);
    }

    public function checkCompany()
    {
        return $this->belongsTo(Company::class, 'check_company_id');
    }

    public function expertInspectionUsers()
    {
        return $this->hasMany(ExpertInspectionUser::class, 'expert_company_id');
    }
}
