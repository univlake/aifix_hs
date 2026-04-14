<?php

namespace App\Http\Controllers\Api;

use App\Models\Company;
use App\Traits\ApiResponse;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\Cache;

class Controller extends BaseController
{
    use ApiResponse;

    /**
     * Cache TTL for company hierarchy lookups (5 minutes).
     * Invalidate via Cache::forget("company_produce_children:{$id}")
     * whenever a company's status, is_produce, or pid changes.
     */
    private const HIERARCHY_TTL = 300;

    /**
     * Return all active, is_produce=1 descendant IDs for a given company.
     * Used for permission scoping on production-company-only endpoints.
     *
     * Results are cached per root company to eliminate recursive N+1 queries.
     */
    public function childId(int $id): array
    {
        return Cache::remember(
            "company_produce_children:{$id}",
            self::HIERARCHY_TTL,
            fn (): array => $this->fetchChildIds($id, produceOnly: true),
        );
    }

    /**
     * Return all active descendant company IDs (regardless of is_produce).
     * Used for broader company-hierarchy scoping.
     *
     * Results are cached per root company to eliminate recursive N+1 queries.
     */
    public function getCompanyId(int $id): array
    {
        return Cache::remember(
            "company_children:{$id}",
            self::HIERARCHY_TTL,
            fn (): array => $this->fetchChildIds($id, produceOnly: false),
        );
    }

    /**
     * Flush both hierarchy caches for a company when its tree structure changes.
     * Call this from CompanyController whenever pid, status, or is_produce is updated.
     */
    public static function flushCompanyHierarchyCache(int $id): void
    {
        Cache::forget("company_produce_children:{$id}");
        Cache::forget("company_children:{$id}");
    }

    /**
     * Recursively collect descendant IDs.
     * This private method does the actual DB work — caching is handled by the public callers.
     *
     * @return array<int>
     */
    private function fetchChildIds(int $id, bool $produceOnly): array
    {
        $query = Company::query()
            ->where('pid', $id)
            ->where('status', 1);

        if ($produceOnly) {
            $query->where('is_produce', 1);
        }

        $childIds = $query->pluck('id');

        if ($childIds->isEmpty()) {
            return [];
        }

        $result = $childIds->all();

        foreach ($childIds as $childId) {
            $result = array_merge($result, $this->fetchChildIds($childId, $produceOnly));
        }

        return $result;
    }
}
