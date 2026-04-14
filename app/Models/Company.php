<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Company extends BaseModel
{
    use HasFactory;

    protected $fillable = [
        'title',
        'enterprise_type_id',
        'operational_type_id',
        'area_id',
        'address',
        'established',
        'credit_code',
        'business_scope',
        'company_introduction',
        'longitude',
        'dimension',
        'geographic_range',
        'acreage',
        'supervise_name',
        'supervise_tel',
        'supervise_fix',
        'supervise_email',
        'supervise_position',
        'status',
        'pid',
        'is_produce',
        'is_bloc',
        'inherent_risk',
        'inherent_risk_grade',
        'float_risk',
        'float_risk_grade',
        'user_id',
        'last_user_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => 'integer',
            'pid' => 'integer',
            'is_produce' => 'integer',
            'is_bloc' => 'integer',
            'enterprise_type_id' => 'integer',
            'operational_type_id' => 'integer',
            'area_id' => 'integer',
            'longitude' => 'decimal:6',
            'dimension' => 'decimal:6',
            'acreage' => 'decimal:3',
            'inherent_risk' => 'decimal:2',
            'float_risk' => 'decimal:2',
            'user_id' => 'integer',
            'last_user_id' => 'integer',
        ];
    }

    public function operationalType(): BelongsTo
    {
        return $this->belongsTo(OperationalType::class, 'operational_type_id');
    }

    public function enterpriseType(): BelongsTo
    {
        return $this->belongsTo(EnterpriseType::class, 'enterprise_type_id');
    }

    public function baseArea(): BelongsTo
    {
        return $this->belongsTo(BaseArea::class, 'area_id', 'area_id');
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class, 'company_id');
    }

    /**
     * 下属企业（层级关系）
     */
    public function companies(): HasMany
    {
        return $this->hasMany(Company::class, 'pid');
    }

    /**
     * 父级企业名称
     */
    public function pidName(): BelongsTo
    {
        return $this->belongsTo(Company::class, 'pid');
    }

    /**
     * 重大危险源
     */
    public function majorHazards(): HasMany
    {
        return $this->hasMany(MajorHazard::class);
    }

    /**
     * 获取状态字符串
     */
    public function getStatusStrAttribute(): string
    {
        return match ($this->status) {
            0 => '待审核',
            1 => '已启用',
            2 => '已禁用',
            default => '未知',
        };
    }
}
