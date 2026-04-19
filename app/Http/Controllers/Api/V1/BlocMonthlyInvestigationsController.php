<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\MonthlyInvestigation;
use App\Traits\ApiTree;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocMonthlyInvestigationsController extends Controller
{
    use ApiTree;

    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyIds = $this->resolveCompanyIds((int) $request->company_id);

        $data = MonthlyInvestigation::query()
            ->whereIn('company_id', $companyIds)
            ->with(['company:id,title', 'monthlyInvestigationReviews', 'monthlyInvestigationViews'])
            ->when($request->filled('type'), fn ($q) => $q->where('type', $request->type))
            ->when($request->filled('level'), fn ($q) => $q->where('level', $request->level))
            ->when($request->filled('inv_year'), function ($q) use ($request) {
                $q->whereYear('inv_time', (int) $request->inv_year);
            })
            ->orderByDesc('inv_time')
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
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
