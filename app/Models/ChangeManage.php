<?php

namespace App\Models;

class ChangeManage extends BaseModel
{
    protected $fillable = [
        'title',
        'department_name',
        'apply_date',
        'reason',
        'apply_leader_opinion',
        'apply_leader_opinion_date',
        'risk_analyze',
        'manage_leader_opinion',
        'manage_leader_opinion_date',
        'approve',
        'approve_date',
        'acceptance_info',
        'acceptance_info_date',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
            'apply_date' => 'date',
            'apply_leader_opinion_date' => 'date',
            'manage_leader_opinion_date' => 'date',
            'approve_date' => 'date',
            'acceptance_info_date' => 'date',
        ];
    }
}
