<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSystemChecksRequest;
use App\Http\Requests\Api\V1\UpdateSystemChecksRequest;
use App\Models\Company;
use App\Models\InformationDraft;
use App\Models\MonthStatistic;
use App\Models\OfficeNotifyScope;
use App\Models\SystemCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SystemChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = SystemCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = SystemCheck::with('company:id,title')->find($id);

        if (! $data) {
            return $this->notFound('系统考核记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreSystemChecksRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = SystemCheck::create($data);

        return $this->success($record);
    }

    public function update(UpdateSystemChecksRequest $request, int $id): JsonResponse
    {
        $record = SystemCheck::find($id);

        if (! $record) {
            return $this->notFound('系统考核记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = SystemCheck::find($id);

        if (! $record) {
            return $this->notFound('系统考核记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    /**
     * 下级企业活动参与及材料上报情况汇总列表（按年份）。
     */
    public function submissions(Request $request): JsonResponse
    {
        $request->validate(['pid' => 'required|integer']);
        $pid = (int) $request->pid;

        $subordinateIds = Company::query()->where('pid', $pid)->pluck('id')->all();

        $query = SystemCheck::query()->whereIn('company_id', $subordinateIds);
        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }
        $records = $query->with('company:id,title')->orderByDesc('year')->get();

        $list = $records->map(fn (SystemCheck $r) => [
            'id' => $r->id,
            'company_id' => (int) $r->company_id,
            'company_name' => $r->company?->title ?? '',
            'year' => (int) $r->year,
            'number' => (float) $r->number,
            'number_v1' => (float) $r->number_v1,
            'number_v2' => (float) $r->number_v2,
            'number_v3' => (float) $r->number_v3,
            'number_v4' => (float) $r->number_v4,
            'number_v5' => (float) $r->number_v5,
            'updated_at' => $r->updated_at,
            'title' => '活动参与及材料上报情况',
        ])->values();

        return $this->success($list);
    }

    /**
     * 自动计算并保存活动参与及材料上报情况分数。
     *
     *   v1：月报覆盖率 = 覆盖月份数 / 12 * 4
     *   v2：年报（保留为 0，业务未启用）
     *   v3：通知型反馈（保留为 0，业务未启用）
     *   v4：任务型反馈率 = 已反馈 / 总数 * 4
     *   v5：信息稿件条数折算 = min(稿件数/8, 1) * 2
     */
    public function computeScore(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $companyIds = Company::query()->where('pid', $companyId)->where('status', 1)->pluck('id')->all();
        $companyIds[] = $companyId;

        $months = MonthStatistic::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)
            ->pluck('created_at')
            ->map(fn ($d) => $d?->format('m'))
            ->filter()
            ->unique()
            ->values();
        $v1 = round($months->count() / 12 * 4, 2);

        $v2 = 0.0; // 年报（未启用）
        $v3 = 0.0; // 通知型（未启用）

        $officeTotal = OfficeNotifyScope::query()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->count();
        $officeDone = OfficeNotifyScope::query()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->where('feedback_status', '已反馈')
            ->count();
        $v4 = $officeTotal > 0 ? round($officeDone / $officeTotal * 4, 2) : 0.0;

        $drafts = InformationDraft::query()
            ->where('company_id', $companyId)
            ->whereYear('created_at', $year)
            ->count();
        $v5 = $drafts >= 8 ? 2.0 : round($drafts / 8 * 2, 2);

        $final = round($v1 + $v2 + $v3 + $v4 + $v5, 2);

        $userId = auth()->id() ?? 0;

        $row = SystemCheck::query()->firstOrNew([
            'company_id' => $companyId,
            'year' => $year,
        ]);
        $row->number_v1 = $v1;
        $row->number_v2 = $v2;
        $row->number_v3 = $v3;
        $row->number_v4 = $v4;
        $row->number_v5 = $v5;
        $row->number = (int) round($final);
        if (! $row->exists) {
            $row->user_id = $userId;
        }
        $row->last_user_id = $userId;
        $row->save();

        return $this->success($row->fresh());
    }
}
