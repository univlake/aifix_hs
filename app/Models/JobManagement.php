<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobManagement extends BaseModel
{
    protected $table = 'job_management';

    protected $fillable = [
        'department',
        'content',
        'type',
        'special_type',
        'position',
        'job_time',
        'unit',
        'is_outsourcing',
        'evaluation_unit_id',
        'job_people_number',
        'job_people_name',
        'risk_analysis',
        'risk_protection',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'is_outsourcing' => 'integer',
            'evaluation_unit_id' => 'integer',
            'job_people_number' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
            'job_time' => 'date',
        ];
    }

    public function evaluationUnit(): BelongsTo
    {
        return $this->belongsTo(EvaluationUnit::class, 'evaluation_unit_id');
    }
}
