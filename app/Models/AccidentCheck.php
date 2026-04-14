<?php

namespace App\Models;

class AccidentCheck extends BaseModel
{
    protected $fillable = [
        'accident_check_template_id',
        'path',
        'number',
        'comment',
        'company_id',
        'year',
        'user_id',
        'last_user_id',
    ];

    public function accidentCheckTemplate()
    {
        return $this->belongsTo(AccidentCheckTemplate::class, 'accident_check_template_id');
    }
}
