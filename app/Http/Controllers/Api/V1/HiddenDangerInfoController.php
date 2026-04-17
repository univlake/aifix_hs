<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreHiddenDangerInfoRequest;
use App\Http\Requests\Api\V1\UpdateHiddenDangerInfoRequest;
use App\Models\HiddenDangerInfo;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class HiddenDangerInfoController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = HiddenDangerInfo::query()
            ->when($request->filled('expert_inspection_id'), fn ($q) => $q->where('expert_inspection_id', $request->expert_inspection_id))
            ->when($request->filled('company_id'), fn ($q) => $q->where('company_id', $request->company_id))
            ->when($request->filled('expert_company_id'), fn ($q) => $q->where('expert_company_id', $request->expert_company_id))
            ->when($request->filled('area'), fn ($q) => $q->where('area', 'like', '%'.$request->area.'%'))
            ->when($request->filled('hidden_level'), fn ($q) => $q->where('hidden_level', $request->hidden_level))
            ->when($request->filled('correct_status'), fn ($q) => $q->where('correct_status', $request->correct_status))
            ->when($request->filled('hidden_type'), fn ($q) => $q->where('hidden_type', $request->hidden_type))
            ->with(['hiddenReviewAnnex', 'hiddenExamineAnnex'])
            ->orderByDesc('created_at');

        $data = $query->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = HiddenDangerInfo::with(['hiddenReviewAnnex', 'hiddenExamineAnnex'])->find($id);

        if (! $data) {
            return $this->notFound('隐患信息不存在');
        }

        return $this->success($data);
    }

    public function store(StoreHiddenDangerInfoRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $hiddenExamineAnnex = $data['hiddenExamineAnnex'] ?? [];
        $hiddenReviewAnnex = $data['hiddenReviewAnnex'] ?? [];
        unset($data['hiddenExamineAnnex'], $data['hiddenReviewAnnex']);

        $result = DB::transaction(function () use ($data, $hiddenExamineAnnex, $hiddenReviewAnnex) {
            $hiddenDangerInfo = HiddenDangerInfo::create($data);

            foreach ($hiddenExamineAnnex as $v) {
                $hiddenDangerInfo->hiddenExamineAnnex()->create([
                    'geolocation' => $v['geolocation'] ?? '',
                    'is_review' => 1,
                    'annex_url' => $v['annex_url'] ?? '',
                    'user_id' => auth()->id() ?? 0,
                ]);
            }

            foreach ($hiddenReviewAnnex as $v) {
                $hiddenDangerInfo->hiddenReviewAnnex()->create([
                    'geolocation' => $v['geolocation'] ?? '',
                    'is_review' => 2,
                    'annex_url' => $v['annex_url'] ?? '',
                    'user_id' => auth()->id() ?? 0,
                ]);
            }

            return $hiddenDangerInfo->load(['hiddenReviewAnnex', 'hiddenExamineAnnex']);
        });

        return $this->success($result);
    }

    public function update(UpdateHiddenDangerInfoRequest $request, int $id): JsonResponse
    {
        $hiddenDangerInfo = HiddenDangerInfo::find($id);

        if (! $hiddenDangerInfo) {
            return $this->notFound('隐患信息不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        if (! empty($data['review_description'])) {
            $data['zg_user_id'] = auth()->id() ?? 0;
        }
        if (! empty($data['review_user_id'])) {
            $data['review_time'] = now();
        }

        $hiddenExamineAnnex = $data['hiddenExamineAnnex'] ?? null;
        $hiddenReviewAnnex = $data['hiddenReviewAnnex'] ?? null;
        unset($data['hiddenExamineAnnex'], $data['hiddenReviewAnnex']);

        DB::transaction(function () use ($hiddenDangerInfo, $data, $hiddenExamineAnnex, $hiddenReviewAnnex) {
            $hiddenDangerInfo->update($data);

            if ($hiddenExamineAnnex !== null) {
                $hiddenDangerInfo->hiddenExamineAnnex()->delete();
                foreach ($hiddenExamineAnnex as $v) {
                    $hiddenDangerInfo->hiddenExamineAnnex()->create([
                        'geolocation' => $v['geolocation'] ?? '',
                        'is_review' => 1,
                        'annex_url' => $v['annex_url'] ?? '',
                        'user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            if ($hiddenReviewAnnex !== null) {
                $hiddenDangerInfo->hiddenReviewAnnex()->delete();
                foreach ($hiddenReviewAnnex as $v) {
                    $hiddenDangerInfo->hiddenReviewAnnex()->create([
                        'geolocation' => $v['geolocation'] ?? '',
                        'is_review' => 2,
                        'annex_url' => $v['annex_url'] ?? '',
                        'user_id' => auth()->id() ?? 0,
                    ]);
                }
            }
        });

        return $this->success($hiddenDangerInfo->fresh(['hiddenReviewAnnex', 'hiddenExamineAnnex']));
    }

    public function destroy(int $id): JsonResponse
    {
        $hiddenDangerInfo = HiddenDangerInfo::find($id);

        if (! $hiddenDangerInfo) {
            return $this->notFound('隐患信息不存在');
        }

        DB::transaction(function () use ($hiddenDangerInfo) {
            $hiddenDangerInfo->hiddenExamineAnnex()->delete();
            $hiddenDangerInfo->hiddenReviewAnnex()->delete();
            $hiddenDangerInfo->delete();
        });

        return $this->message('删除成功');
    }
}
