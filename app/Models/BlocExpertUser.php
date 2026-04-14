<?php

namespace App\Models;

class BlocExpertUser extends BaseModel
{
    protected $fillable = [
        'expert_user_id',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'expert_user_id');
    }
}
