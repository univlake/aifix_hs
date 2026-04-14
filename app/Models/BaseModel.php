<?php

namespace App\Models;

use DateTimeInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\ActivityLogger;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

class BaseModel extends Model
{
    use HasFactory, LogsActivity, SoftDeletes;

    // ── Activity Log ────────────────────────────────────────────────────────────

    /**
     * Only log changed attributes (not the full model on every save).
     * Skip empty/no-op saves. Ignore updated_at — it changes on every save
     * and produces noise with no audit value.
     */
    protected static $logAttributes = ['*'];

    protected static $ignoreChangedAttributes = ['updated_at'];

    protected static $logOnlyDirty = true;

    protected static $submitEmptyLogs = false;

    // ── Date Formatting ─────────────────────────────────────────────────────────

    protected function serializeDate(DateTimeInterface $date): string
    {
        return $date->format($this->dateFormat ?: 'Y-m-d H:i:s');
    }

    // ── Reusable Query Scopes ───────────────────────────────────────────────────

    /**
     * Filter to records with status = 1 (active/enabled).
     * Eliminates repeated ->where('status', 1) in every controller.
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 1);
    }

    /**
     * Filter to records for a specific company.
     * Eliminates repeated ->where('company_id', $id) in every controller.
     */
    public function scopeForCompany(Builder $query, int $companyId): Builder
    {
        return $query->where('company_id', $companyId);
    }

    /**
     * Filter to records within a set of company IDs (for hierarchy lookups).
     */
    public function scopeInCompanies(Builder $query, array $companyIds): Builder
    {
        return $query->whereIn('company_id', $companyIds);
    }

    /**
     * Order by newest first (most common default).
     */
    public function scopeLatestFirst(Builder $query): Builder
    {
        return $query->orderBy('id', 'desc');
    }

    // ── Bulk Operation Helpers ──────────────────────────────────────────────────

    /**
     * Disable activity logging for the duration of a bulk operation callback.
     * Use this when importing or batch-updating many records to avoid
     * write-amplification on the activity_log table.
     *
     * Usage:
     *   BaseModel::withoutLogging(fn () => Model::insert($rows));
     */
    public static function withoutLogging(callable $callback): mixed
    {
        $wasEnabled = static::$logOnlyDirty;

        // Spatie activitylog respects this flag at the trait level
        ActivityLogger::$enabled = false;

        try {
            return $callback();
        } finally {
            ActivityLogger::$enabled = true;
        }
    }
}
