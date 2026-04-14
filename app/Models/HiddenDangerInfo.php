<?php

namespace App\Models;

class HiddenDangerInfo extends BaseModel
{
    protected $fillable = [
        'expert_inspection_id',
        'expert_company_id',
        'check_company_id',
        'area',
        'session',
        'description',
        'hidden_type',
        'hidden_level',
        'legalises',
        'proposal',
        'correct_deadline',
        'invest_status',
        'zg_user_id',
        'correct_status',
        'correct_date',
        'review_description',
        'review_user_id',
        'review_time',
        'archive_user_id',
        'comment',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function hiddenReviewAnnex()
    {
        return $this->hasMany(HiddenUploadAnnex::class)->where('is_review', 2);
    }

    public function hiddenExamineAnnex()
    {
        return $this->hasMany(HiddenUploadAnnex::class)->where('is_review', 1);
    }
}
