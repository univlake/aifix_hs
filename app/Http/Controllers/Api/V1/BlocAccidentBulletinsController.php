<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentBulletin;
use App\Models\Company;
use App\Traits\ApiTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BlocAccidentBulletinsController extends Controller
{
    use ApiTree;

    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyIds = $this->resolveCompanyIds((int) $request->company_id);

        $query = AccidentBulletin::query()
            ->whereIn('company_id', $companyIds)
            ->with('company:id,title')
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->when($request->filled('accident_level'), fn ($q) => $q->where('accident_level', $request->accident_level))
            ->when($request->filled('happen_year'), function ($q) use ($request) {
                $q->whereYear('happen_time', (int) $request->happen_year);
            })
            ->orderByDesc('happen_time')
            ->orderByDesc('id');

        $list = $query->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * Yearly aggregates: accident count, total hurt, total deaths — for the chart.
     */
    public function annualStats(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyIds = $this->resolveCompanyIds((int) $request->company_id);

        $rows = DB::table('accident_bulletins')
            ->whereIn('company_id', $companyIds)
            ->whereNull('deleted_at')
            ->whereNotNull('happen_time')
            ->selectRaw("strftime('%Y', happen_time) as year")
            ->selectRaw('COUNT(*) as accident_count')
            ->selectRaw('COALESCE(SUM(staff_hurt), 0) + COALESCE(SUM(not_staff_hurt), 0) as hurt_count')
            ->selectRaw('COALESCE(SUM(staff_die), 0) + COALESCE(SUM(not_staff_die), 0) as death_count')
            ->groupByRaw("strftime('%Y', happen_time)")
            ->orderBy('year')
            ->get();

        return $this->success($rows);
    }

    private function resolveCompanyIds(int $companyId): array
    {
        $company = Company::query()
            ->where('id', $companyId)
            ->with('companies')
            ->first();

        if (! $company) {
            return [$companyId];
        }

        return $this->ascTree($company);
    }
}
