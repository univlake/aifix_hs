<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Enforces "a user can only query companies inside their own hierarchy".
 *
 * Reads two inputs (either or both may be present):
 *  - Header:       X-Scope-Company-Id (set by the frontend scope switcher)
 *  - Query/body:   company_id         (the filter most list/show controllers accept)
 *
 * For each id present, confirms the authenticated user's company is an
 * ancestor-or-equal of the target. A mismatch returns 403 immediately.
 *
 * When a valid scope is resolved, binds it via app()->instance('scope.company', $company)
 * so controllers can read the active scope without re-fetching.
 *
 * Routes that don't receive either input (e.g. /api/v1/users when the caller
 * genuinely wants global data) are unaffected — the middleware is a no-op.
 */
class ValidateScopeCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $ownCompanyId = (int) ($user->company_id ?? 0);

        if (! $ownCompanyId) {
            return $next($request);
        }

        $candidateIds = $this->extractCompanyIds($request);

        foreach ($candidateIds as $candidateId) {
            $target = Company::find($candidateId);

            if (! $target) {
                return response()->json(['message' => '无效的企业范围'], 403);
            }

            if (! $this->isInHierarchy($ownCompanyId, $target)) {
                return response()->json(['message' => '无权访问该企业数据'], 403);
            }

            // Bind the most specific scope resolved (prefer header over query).
            app()->instance('scope.company', $target);
        }

        return $next($request);
    }

    /**
     * We enforce ownership only for values that come from the client-controlled
     * "filter" surface — the X-Scope-Company-Id header and the company_id QUERY
     * parameter (used on GET list/show endpoints).
     *
     * We deliberately do NOT validate company_id in POST/PUT/PATCH BODIES: those
     * are legitimate admin operations (assigning a user to any company, moving a
     * record cross-tenant, etc.) which are governed by the per-module *.create /
     * *.update permission, not by hierarchy scope.
     *
     * @return array<int>
     */
    private function extractCompanyIds(Request $request): array
    {
        $ids = [];

        $header = $request->header('X-Scope-Company-Id');

        if (is_numeric($header)) {
            $ids[] = (int) $header;
        }

        $queryValue = $request->query('company_id');

        if (is_string($queryValue) && is_numeric($queryValue)) {
            $ids[] = (int) $queryValue;
        }

        return array_values(array_unique($ids));
    }

    /**
     * Returns true if $ownCompanyId is an ancestor (or equal) of $target
     * by walking up the pid chain.
     */
    private function isInHierarchy(int $ownCompanyId, Company $target): bool
    {
        if ($target->id === $ownCompanyId) {
            return true;
        }

        $current = $target;
        $maxDepth = 10;

        for ($depth = 0; $depth < $maxDepth; $depth++) {
            if (! $current->pid) {
                break;
            }

            if ($current->pid === $ownCompanyId) {
                return true;
            }

            $current = Company::find($current->pid);

            if (! $current) {
                break;
            }
        }

        return false;
    }
}
