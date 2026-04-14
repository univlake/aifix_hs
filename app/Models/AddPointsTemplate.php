<?php

namespace App\Models;

class AddPointsTemplate extends BaseModel
{
    protected $fillable = [
        'title',
        'level',
        'sort',
        'pid',
        'year',
        'score_range',
    ];

    public function child()
    {
        return $this->hasMany(AddPointsTemplate::class, 'pid');
    }

    public function check()
    {
        return $this->hasOne(AddPoint::class);
    }
}
