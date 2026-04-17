<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreFundingExecutionRequest;
use App\Http\Requests\Api\V1\UpdateFundingExecutionRequest;
use App\Models\FundingExecution;
use App\Models\SecurityInvestment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FundingExecutionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FundingExecution::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('security_investment')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        // Compute proportion = execution budget / annual total investment × 100%
        // Aggregate once per unique year to avoid N+1 queries.
        if ($request->filled('company_id') && $list->isNotEmpty()) {
            $companyId = (int) $request->company_id;
            $years = $list->pluck('year')->unique()->filter()->values();

            $annualTotals = SecurityInvestment::where('company_id', $companyId)
                ->whereIn('year', $years)
                ->selectRaw('year, SUM(budget) as total')
                ->groupBy('year')
                ->pluck('total', 'year')
                ->all();

            $list->through(function ($item) use ($annualTotals) {
                $total = (float) ($annualTotals[$item->year] ?? 0);
                $item->proportion = $total > 0
                    ? round((float) $item->budget / $total * 100, 2).'%'
                    : '0%';

                return $item;
            });
        }

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = FundingExecution::with('security_investment')->find($id);

        if (! $data) {
            return $this->notFound('经费执行情况不存在');
        }

        return $this->success($data);
    }

    public function store(StoreFundingExecutionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FundingExecution::create($data);

        return $this->success($record);
    }

    public function update(UpdateFundingExecutionRequest $request, int $id): JsonResponse
    {
        $record = FundingExecution::find($id);

        if (! $record) {
            return $this->notFound('经费执行情况不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FundingExecution::find($id);

        if (! $record) {
            return $this->notFound('经费执行情况不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
