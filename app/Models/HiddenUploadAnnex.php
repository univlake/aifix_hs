<?php

namespace App\Models;

class HiddenUploadAnnex extends BaseModel
{
    protected $fillable = [
        'hidden_danger_info_id',
        'geolocation',
        'is_review',
        'annex_url',
        'user_id',
    ];
}
