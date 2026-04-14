<?php

namespace App\Models;

class FilingPermission extends BaseModel
{
    protected $fillable = [
        'record_type_id',
        'issuing_department',
        'filing_range',
        'filing_time',
        'valid_period',
        'comment',
        'annex_url',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    public function recordType()
    {
        return $this->belongsTo(RecordType::class);
    }
}
