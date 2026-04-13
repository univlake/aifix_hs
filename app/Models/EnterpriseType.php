<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class EnterpriseType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
    ];
}
