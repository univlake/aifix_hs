<?php

namespace App\Models;

class SpaceWork extends BaseModel
{
    protected $fillable = [
        'name',
        'position',
        'space_work_type_id',
        'size',
        'word_content',
        'people_num',
        'hazard_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function spaceWorkType()
    {
        return $this->belongsTo(SpaceWorkType::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
