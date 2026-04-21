<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\NewNotifyScope;
use App\Models\OfficeNotifyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoticeStatsController extends Controller
{
    /**
     * 汇总每家直接下级企业对任务型 / 通知型通知的反馈 / 阅读情况。
     */
    public function summary(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $subordinates = Company::query()
            ->where('pid', (int) $request->company_id)
            ->select(['id', 'title'])
            ->orderBy('id')
            ->get();

        if ($subordinates->isEmpty()) {
            return $this->success([]);
        }

        $ids = $subordinates->pluck('id')->all();

        $officeCounts = OfficeNotifyScope::query()
            ->whereIn('company_id', $ids)
            ->selectRaw('company_id, COUNT(*) AS total, SUM(CASE WHEN feedback_status = ? THEN 1 ELSE 0 END) AS fed_back', ['已反馈'])
            ->groupBy('company_id')
            ->get()
            ->keyBy('company_id');

        $newCounts = NewNotifyScope::query()
            ->whereIn('company_id', $ids)
            ->selectRaw('company_id, COUNT(*) AS total, SUM(CASE WHEN read_status = ? THEN 1 ELSE 0 END) AS read_count', ['已读'])
            ->groupBy('company_id')
            ->get()
            ->keyBy('company_id');

        $rows = $subordinates->map(function (Company $c) use ($officeCounts, $newCounts) {
            $office = $officeCounts->get($c->id);
            $new = $newCounts->get($c->id);

            $officeTotal = (int) ($office->total ?? 0);
            $officeFedBack = (int) ($office->fed_back ?? 0);
            $newTotal = (int) ($new->total ?? 0);
            $newRead = (int) ($new->read_count ?? 0);

            return [
                'company_id' => (int) $c->id,
                'company_name' => (string) $c->title,
                'office_total' => $officeTotal,
                'office_fed_back' => $officeFedBack,
                'office_pending' => max(0, $officeTotal - $officeFedBack),
                'new_total' => $newTotal,
                'new_read' => $newRead,
                'new_pending' => max(0, $newTotal - $newRead),
                'pending_total' => max(0, $officeTotal - $officeFedBack) + max(0, $newTotal - $newRead),
            ];
        })->values();

        return $this->success($rows);
    }

    /**
     * 查看指定下级企业尚未反馈 / 尚未阅读的通知公告明细。
     */
    public function pending(Request $request): JsonResponse
    {
        $request->validate(['subordinate_id' => 'required|integer']);
        $sid = (int) $request->subordinate_id;

        $office = OfficeNotifyScope::query()
            ->where('company_id', $sid)
            ->where(function ($q) {
                $q->whereNull('feedback_status')->orWhere('feedback_status', '!=', '已反馈');
            })
            ->with(['officeNotify:id,name,comment,feedback_time,alert_others,annex_url'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($scope) => [
                'scope_id' => (int) $scope->id,
                'notice_id' => (int) $scope->office_notify_id,
                'notice_name' => optional($scope->officeNotify)->name,
                'comment' => optional($scope->officeNotify)->comment,
                'alert_others' => optional($scope->officeNotify)->alert_others,
                'feedback_deadline' => optional($scope->officeNotify)->feedback_time,
                'notice_created_at' => optional($scope->officeNotify)->created_at,
            ]);

        $new = NewNotifyScope::query()
            ->where('company_id', $sid)
            ->where(function ($q) {
                $q->whereNull('read_status')->orWhere('read_status', '!=', '已读');
            })
            ->with(['newNotify:id,name,comment,alert_others,annex_url'])
            ->orderByDesc('id')
            ->get()
            ->map(fn ($scope) => [
                'scope_id' => (int) $scope->id,
                'notice_id' => (int) $scope->new_notify_id,
                'notice_name' => optional($scope->newNotify)->name,
                'comment' => optional($scope->newNotify)->comment,
                'alert_others' => optional($scope->newNotify)->alert_others,
                'notice_created_at' => optional($scope->newNotify)->created_at,
            ]);

        return $this->success([
            'office' => $office,
            'new' => $new,
        ]);
    }
}
