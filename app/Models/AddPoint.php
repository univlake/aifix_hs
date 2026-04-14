<?php

namespace App\Models;

class AddPoint extends BaseModel
{
    protected $fillable = [
        'add_points_template_id',
        'path',
        'number',
        'comment',
        'company_id',
        'year',
        'user_id',
        'last_user_id',
    ];

    public function addPointsTemplate()
    {
        return $this->belongsTo(AddPointsTemplate::class, 'add_points_template_id');
    }
}
