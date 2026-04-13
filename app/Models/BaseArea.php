<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BaseArea extends Model
{
    protected $primaryKey = 'area_id';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'area_id',
        'statistical_area_id',
        'area_name',
        'area_parent_id',
        'area_sort',
        'allname',
        'all_childrens_id',
        'parent_ids',
        'parent_ids_withself',
    ];

    protected function casts(): array
    {
        return [
            'area_id' => 'integer',
            'statistical_area_id' => 'integer',
            'area_parent_id' => 'integer',
            'area_sort' => 'integer',
        ];
    }
}
