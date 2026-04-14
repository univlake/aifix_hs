<?php

namespace App\Models;

class MonthlyInvestigation extends BaseModel
{
    protected $fillable = [
        'type',
        'is_fire_fighting',
        'is_emergency',
        'content',
        'inv_time',
        'inv_name',
        'level',
        'proposal',
        'legalbasis',
        'correct_date',
        'review_discription',
        'review_date',
        'review_content',
        'review_user',
        'correct_result',
        'is_govern',
        'govern_title',
        'govern_supplies',
        'govern_user',
        'govern_date',
        'govern_text',
        'govern_money',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function monthlyInvestigationReviews()
    {
        return $this->hasMany(MonthlyInvestigationReview::class);
    }

    public function monthlyInvestigationViews()
    {
        return $this->hasMany(MonthlyInvestigationView::class);
    }
}
