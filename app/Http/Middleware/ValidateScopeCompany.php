<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Reads the X-Scope-Company-Id header sent by the frontend scope context.
 *
 * When present:
 *  1. Loads the requested company.
 *  2. Confirms the authenticated user's company is an ancestor-or-equal of the
 *     requested scope company (hierarchy ownership check).
 *  3. Binds the resolved company via app()->instance('scope.company', $company)
 *     so controllers can call app('scope.company') to get the active scope.
 *
 * When absent the middleware is a complete no-op — existing behaviour is
 * preserved and controllers fall back to the user's own company.
 */
class ValidateScopeCompany
{
    public function handle(Request $request, Closure $next): Response
    {
        $scopeId = $request->header('X-Scope-Company-Id');

        if (! $scopeId || ! is_numeric($scopeId)) {
            return $next($request);
        }

        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        $scopeCompany = Company::find((int) $scopeId);

        if (! $scopeCompany) {
            return response()->json(['message' => '无效的企业范围'], 403);
        }

        if (! $this->isInHierarchy((int) $user->company_id, $scopeCompany)) {
            return response()->json(['message' => '无权访问该企业数据'], 403);
        }

        app()->instance('scope.company', $scopeCompany);

        return $next($request);
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
