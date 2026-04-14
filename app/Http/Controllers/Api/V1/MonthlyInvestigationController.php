<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreMonthlyInvestigationRequest;
use App\Http\Requests\Api\V1\UpdateMonthlyInvestigationRequest;
use App\Models\MonthlyInvestigation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonthlyInvestigationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MonthlyInvestigation::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }
        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $data = $query->with(['monthlyInvestigationReviews', 'monthlyInvestigationViews'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = MonthlyInvestigation::with(['monthlyInvestigationReviews', 'monthlyInvestigationViews'])->find($id);

        if (! $data) {
            return $this->notFound('月度排查不存在');
        }

        return $this->success($data);
    }

    public function store(StoreMonthlyInvestigationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $reviews = $data['monthlyInvestigationReviews'] ?? [];
        $views = $data['monthlyInvestigationViews'] ?? [];
        unset($data['monthlyInvestigationReviews'], $data['monthlyInvestigationViews']);

        $result = DB::transaction(function () use ($data, $reviews, $views) {
            $monthlyInvestigation = MonthlyInvestigation::create($data);
            $companyId = $data['company_id'];

            foreach ($reviews as $v) {
                $monthlyInvestigation->monthlyInvestigationReviews()->create([
                    'annex_url' => $v['annex_url'] ?? '',
                    'company_id' => $companyId,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            foreach ($views as $v) {
                $monthlyInvestigation->monthlyInvestigationViews()->create([
                    'annex_url' => $v['annex_url'] ?? '',
                    'company_id' => $companyId,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $monthlyInvestigation->load(['monthlyInvestigationReviews', 'monthlyInvestigationViews']);
        });

        return $this->success($result);
    }

    public function update(UpdateMonthlyInvestigationRequest $request, int $id): JsonResponse
    {
        $monthlyInvestigation = MonthlyInvestigation::find($id);

        if (! $monthlyInvestigation) {
            return $this->notFound('月度排查不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $reviews = $data['monthlyInvestigationReviews'] ?? null;
        $views = $data['monthlyInvestigationViews'] ?? null;
        unset($data['monthlyInvestigationReviews'], $data['monthlyInvestigationViews']);

        DB::transaction(function () use ($monthlyInvestigation, $data, $reviews, $views) {
            $monthlyInvestigation->update($data);
            $companyId = $monthlyInvestigation->company_id;

            if ($reviews !== null) {
                $monthlyInvestigation->monthlyInvestigationReviews()->delete();
                foreach ($reviews as $v) {
                    $monthlyInvestigation->monthlyInvestigationReviews()->create([
                        'annex_url' => $v['annex_url'] ?? '',
                        'company_id' => $companyId,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            if ($views !== null) {
                $monthlyInvestigation->monthlyInvestigationViews()->delete();
                foreach ($views as $v) {
                    $monthlyInvestigation->monthlyInvestigationViews()->create([
                        'annex_url' => $v['annex_url'] ?? '',
                        'company_id' => $companyId,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }
        });

        return $this->success($monthlyInvestigation->fresh(['monthlyInvestigationReviews', 'monthlyInvestigationViews']));
    }

    public function destroy(int $id): JsonResponse
    {
        $monthlyInvestigation = MonthlyInvestigation::find($id);

        if (! $monthlyInvestigation) {
            return $this->notFound('月度排查不存在');
        }

        DB::transaction(function () use ($monthlyInvestigation) {
            $monthlyInvestigation->monthlyInvestigationReviews()->delete();
            $monthlyInvestigation->monthlyInvestigationViews()->delete();
            $monthlyInvestigation->delete();
        });

        return $this->message('删除成功');
    }
}
