<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreHiddenDangerInfoRequest;
use App\Http\Requests\Api\V1\UpdateHiddenDangerInfoRequest;
use App\Models\ExpertInspectionUser;
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
            ->when($request->filled('check_company_id'), fn ($q) => $q->where('check_company_id', $request->check_company_id))
            ->when($request->filled('expert_company_id'), fn ($q) => $q->where('expert_company_id', $request->expert_company_id))
            ->when($request->filled('area'), fn ($q) => $q->where('area', 'like', '%'.$request->area.'%'))
            ->when($request->filled('hidden_level'), fn ($q) => $q->where('hidden_level', $request->hidden_level))
            ->when($request->filled('correct_status'), fn ($q) => $q->where('correct_status', $request->correct_status))
            ->when($request->filled('hidden_type'), fn ($q) => $q->where('hidden_type', $request->hidden_type))
            ->when($request->filled('expert_user_id'), function ($q) use ($request) {
                $expertCompanyIds = ExpertInspectionUser::query()
                    ->where('expert_user_id', $request->expert_user_id)
                    ->pluck('expert_company_id');
                $q->whereIn('expert_company_id', $expertCompanyIds);
            })
            ->with(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex', 'checkCompany:id,title'])
            ->orderByDesc('created_at');

        $data = $query->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = HiddenDangerInfo::with([
            'hiddenReviewAnnex',
            'hiddenExamineAnnex',
            'hiddenRectifyAnnex',
            'checkCompany:id,title',
            'expertInspection:id,title,company_id',
            'expertCompany.expertInspectionUsers:id,expert_company_id,expert_user_id',
        ])->find($id);

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
        $hiddenRectifyAnnex = $data['hiddenRectifyAnnex'] ?? [];
        unset($data['hiddenExamineAnnex'], $data['hiddenReviewAnnex'], $data['hiddenRectifyAnnex']);

        $result = DB::transaction(function () use ($data, $hiddenExamineAnnex, $hiddenReviewAnnex, $hiddenRectifyAnnex) {
            $hiddenDangerInfo = HiddenDangerInfo::create($data);

            $this->saveAnnexes($hiddenDangerInfo, $hiddenExamineAnnex, 1);
            $this->saveAnnexes($hiddenDangerInfo, $hiddenReviewAnnex, 2);
            $this->saveAnnexes($hiddenDangerInfo, $hiddenRectifyAnnex, 3);

            return $hiddenDangerInfo->load(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex']);
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
        $hiddenRectifyAnnex = $data['hiddenRectifyAnnex'] ?? null;
        unset($data['hiddenExamineAnnex'], $data['hiddenReviewAnnex'], $data['hiddenRectifyAnnex']);

        DB::transaction(function () use ($hiddenDangerInfo, $data, $hiddenExamineAnnex, $hiddenReviewAnnex, $hiddenRectifyAnnex) {
            $hiddenDangerInfo->update($data);

            if ($hiddenExamineAnnex !== null) {
                $hiddenDangerInfo->hiddenExamineAnnex()->delete();
                $this->saveAnnexes($hiddenDangerInfo, $hiddenExamineAnnex, 1);
            }
            if ($hiddenReviewAnnex !== null) {
                $hiddenDangerInfo->hiddenReviewAnnex()->delete();
                $this->saveAnnexes($hiddenDangerInfo, $hiddenReviewAnnex, 2);
            }
            if ($hiddenRectifyAnnex !== null) {
                $hiddenDangerInfo->hiddenRectifyAnnex()->delete();
                $this->saveAnnexes($hiddenDangerInfo, $hiddenRectifyAnnex, 3);
            }
        });

        return $this->success($hiddenDangerInfo->fresh(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex']));
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
            $hiddenDangerInfo->hiddenRectifyAnnex()->delete();
            $hiddenDangerInfo->delete();
        });

        return $this->message('删除成功');
    }

    /**
     * 隐患整改：受检企业或专家提交整改。
     * 复用字段：zg_user_id（整改人）、correct_date（整改日期）、review_description（整改描述）.
     */
    public function rectify(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'review_description' => 'required|string',
            'correct_date' => 'nullable|date',
            'hiddenRectifyAnnex' => 'nullable|array',
            'hiddenRectifyAnnex.*.geolocation' => 'nullable|string',
            'hiddenRectifyAnnex.*.annex_url' => 'nullable|string',
        ]);

        $record = HiddenDangerInfo::find($id);
        if (! $record) {
            return $this->notFound('隐患信息不存在');
        }

        DB::transaction(function () use ($record, $request) {
            $record->update([
                'zg_user_id' => auth()->id() ?? 0,
                'correct_date' => $request->input('correct_date') ?: now()->toDateString(),
                'review_description' => $request->input('review_description'),
                'correct_status' => 2,
                'last_user_id' => auth()->id() ?? 0,
            ]);

            $annexes = $request->input('hiddenRectifyAnnex', []);
            if ($annexes) {
                $record->hiddenRectifyAnnex()->delete();
                $this->saveAnnexes($record, $annexes, 3);
            }
        });

        return $this->success($record->fresh(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex']));
    }

    /**
     * 整改确认：专家或集团确认整改合格。
     * 复用字段：review_user_id（确认人）、review_time（确认时间）.
     */
    public function confirmRectification(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'hiddenReviewAnnex' => 'nullable|array',
            'hiddenReviewAnnex.*.geolocation' => 'nullable|string',
            'hiddenReviewAnnex.*.annex_url' => 'nullable|string',
        ]);

        $record = HiddenDangerInfo::find($id);
        if (! $record) {
            return $this->notFound('隐患信息不存在');
        }

        DB::transaction(function () use ($record, $request) {
            $record->update([
                'review_user_id' => auth()->id() ?? 0,
                'review_time' => now(),
                'correct_status' => 3,
                'last_user_id' => auth()->id() ?? 0,
            ]);

            $annexes = $request->input('hiddenReviewAnnex', []);
            if ($annexes) {
                $record->hiddenReviewAnnex()->delete();
                $this->saveAnnexes($record, $annexes, 2);
            }
        });

        return $this->success($record->fresh(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex']));
    }

    /**
     * 确认归档：仅集团可操作。复用 archive_user_id（归档人）.
     */
    public function archive(int $id): JsonResponse
    {
        $record = HiddenDangerInfo::find($id);
        if (! $record) {
            return $this->notFound('隐患信息不存在');
        }

        $record->update([
            'archive_user_id' => auth()->id() ?? 0,
            'invest_status' => 2,
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($record->fresh(['hiddenReviewAnnex', 'hiddenExamineAnnex', 'hiddenRectifyAnnex']));
    }

    protected function saveAnnexes(HiddenDangerInfo $danger, array $annexes, int $isReview): void
    {
        $relation = match ($isReview) {
            1 => 'hiddenExamineAnnex',
            2 => 'hiddenReviewAnnex',
            3 => 'hiddenRectifyAnnex',
            default => null,
        };
        if (! $relation) {
            return;
        }
        foreach ($annexes as $v) {
            if (empty($v['annex_url'])) {
                continue;
            }
            $danger->{$relation}()->create([
                'geolocation' => $v['geolocation'] ?? '',
                'is_review' => $isReview,
                'annex_url' => $v['annex_url'],
                'user_id' => auth()->id() ?? 0,
            ]);
        }
    }
}
