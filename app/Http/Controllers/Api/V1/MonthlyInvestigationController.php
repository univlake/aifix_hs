<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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

        if (!$data) {
            return $this->notFound('月度排查不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'nullable|string|max:255',
            'is_fire_fighting' => 'nullable|integer',
            'is_emergency' => 'nullable|integer',
            'content' => 'nullable|string',
            'inv_time' => 'nullable|date',
            'inv_name' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:255',
            'proposal' => 'nullable|string',
            'legalbasis' => 'nullable|string',
            'correct_date' => 'nullable|date',
            'review_discription' => 'nullable|string',
            'review_date' => 'nullable|date',
            'review_content' => 'nullable|string',
            'review_user' => 'nullable|string|max:255',
            'correct_result' => 'nullable|string|max:255',
            'is_govern' => 'nullable|integer',
            'govern_title' => 'nullable|string|max:255',
            'govern_supplies' => 'nullable|string|max:255',
            'govern_user' => 'nullable|string|max:255',
            'govern_date' => 'nullable|string|max:255',
            'govern_text' => 'nullable|string|max:255',
            'govern_money' => 'nullable|string|max:255',
            'company_id' => 'required|integer',
            'monthlyInvestigationReviews' => 'nullable|array',
            'monthlyInvestigationReviews.*.annex_url' => 'nullable|string',
            'monthlyInvestigationViews' => 'nullable|array',
            'monthlyInvestigationViews.*.annex_url' => 'nullable|string',
        ]);

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

    public function update(Request $request, int $id): JsonResponse
    {
        $monthlyInvestigation = MonthlyInvestigation::find($id);

        if (!$monthlyInvestigation) {
            return $this->notFound('月度排查不存在');
        }

        $data = $request->validate([
            'type' => 'sometimes|nullable|string|max:255',
            'is_fire_fighting' => 'sometimes|nullable|integer',
            'is_emergency' => 'sometimes|nullable|integer',
            'content' => 'sometimes|nullable|string',
            'inv_time' => 'sometimes|nullable|date',
            'inv_name' => 'sometimes|nullable|string|max:255',
            'level' => 'sometimes|nullable|string|max:255',
            'proposal' => 'sometimes|nullable|string',
            'legalbasis' => 'sometimes|nullable|string',
            'correct_date' => 'sometimes|nullable|date',
            'review_discription' => 'sometimes|nullable|string',
            'review_date' => 'sometimes|nullable|date',
            'review_content' => 'sometimes|nullable|string',
            'review_user' => 'sometimes|nullable|string|max:255',
            'correct_result' => 'sometimes|nullable|string|max:255',
            'is_govern' => 'sometimes|nullable|integer',
            'govern_title' => 'sometimes|nullable|string|max:255',
            'govern_supplies' => 'sometimes|nullable|string|max:255',
            'govern_user' => 'sometimes|nullable|string|max:255',
            'govern_date' => 'sometimes|nullable|string|max:255',
            'govern_text' => 'sometimes|nullable|string|max:255',
            'govern_money' => 'sometimes|nullable|string|max:255',
            'company_id' => 'sometimes|nullable|integer',
            'monthlyInvestigationReviews' => 'nullable|array',
            'monthlyInvestigationReviews.*.annex_url' => 'nullable|string',
            'monthlyInvestigationViews' => 'nullable|array',
            'monthlyInvestigationViews.*.annex_url' => 'nullable|string',
        ]);

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

        return $this->success($monthlyInvestigation->fresh()->load(['monthlyInvestigationReviews', 'monthlyInvestigationViews']));
    }

    public function destroy(int $id): JsonResponse
    {
        $monthlyInvestigation = MonthlyInvestigation::find($id);

        if (!$monthlyInvestigation) {
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
