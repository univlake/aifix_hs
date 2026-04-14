<?php

namespace App\Models;

class DoubleCheckTemplate extends BaseModel
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
        return $this->hasMany(DoubleCheckTemplate::class, 'pid');
    }

    public function check()
    {
        return $this->hasOne(DoubleCheck::class);
    }
}
