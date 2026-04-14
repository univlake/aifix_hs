<?php

namespace App\Models;

class DailyCheckTemplate extends BaseModel
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
        return $this->hasMany(DailyCheckTemplate::class, 'pid');
    }

    public function check()
    {
        return $this->hasOne(DailyCheck::class);
    }
}
