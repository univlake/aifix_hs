<?php

namespace App\Models;

class CertificateStatus extends BaseModel
{
    protected $fillable = [
        'name',
        'type',
        'should_obtain_people',
        'already_obtain_people',
        'no_obtain_people',
        'train_people',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'type' => 'integer',
            'should_obtain_people' => 'integer',
            'already_obtain_people' => 'integer',
            'train_people' => 'integer',
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }
}
