<?php

namespace App\Models;

class ThreeTogether extends BaseModel
{
    protected $fillable = [
        'name',
        'three_together_type',
        'establish_time',
        'establish_section',
        'status',
        'design_unit_id',
        'design_annex_url',
        'evaluation_unit_id',
        'write_time',
        'construction_comment',
        'safety_requirements',
        'complete_comment',
        'acceptance',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function designUnit()
    {
        return $this->belongsTo(DesignUnit::class);
    }

    public function evaluationUnit()
    {
        return $this->belongsTo(EvaluationUnit::class);
    }
}
