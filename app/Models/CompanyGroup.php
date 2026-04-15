<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CompanyGroup extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'company_id',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'company_id' => 'integer',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }

    public function kidCompanies(): BelongsToMany
    {
        return $this->belongsToMany(
            Company::class,
            'company_group_kids',
            'company_group_id',
            'company_id',
        )->select(['companies.id', 'companies.title', 'companies.status']);
    }
}
