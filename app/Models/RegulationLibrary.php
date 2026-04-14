<?php

namespace App\Models;

class RegulationLibrary extends BaseModel
{
    protected $fillable = [
        'type', 'title', 'established_date', 'effective_date',
        'promulgating_department', 'standard_encoding', 'identify_date',
        'status', 'annex_url', 'regulation_library_type_id',
        'company_id', 'user_id', 'last_user_id',
    ];

    public function regulationType()
    {
        return $this->belongsTo(RegulationLibraryType::class, 'regulation_library_type_id');
    }
}
