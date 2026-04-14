<?php

namespace App\Models;

class AccidentCheckTemplate extends BaseModel
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
        return $this->hasMany(AccidentCheckTemplate::class, 'pid');
    }

    public function check()
    {
        return $this->hasOne(AccidentCheck::class);
    }
}
