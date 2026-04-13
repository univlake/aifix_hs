<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;

class RecordType extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
    ];
}
