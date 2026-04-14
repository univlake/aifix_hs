<?php

namespace App\Models;

class DoubleCheck extends BaseModel
{
    protected $fillable = [
        'double_check_template_id',
        'path',
        'number',
        'comment',
        'company_id',
        'year',
        'user_id',
        'last_user_id',
    ];

    public function doubleCheckTemplate()
    {
        return $this->belongsTo(DoubleCheckTemplate::class, 'double_check_template_id');
    }
}
