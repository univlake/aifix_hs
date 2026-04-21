<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreOfficeNotifyRequest;
use App\Http\Requests\Api\V1\UpdateOfficeNotifyRequest;
use App\Models\OfficeNotify;
use App\Models\OfficeNotifyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OfficeNotifyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = OfficeNotify::query();

        if ($request->filled('company_id')) {
            $companyId = (int) $request->company_id;
            $query->where(function ($q) use ($companyId) {
                $q->where('company_id', $companyId)
                    ->orWhereHas('officeNotifyScope', function ($inner) use ($companyId) {
                        $inner->where('company_id', $companyId);
                    });
            });
        }

        if ($request->filled('notify_company_id')) {
            $query->whereHas('officeNotifyScope', function ($q) use ($request) {
                $q->where('company_id', $request->notify_company_id);
            });
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->with('officeNotifyScope')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = OfficeNotify::with('officeNotifyScope')->find($id);

        if (! $data) {
            return $this->notFound('通知公告不存在');
        }

        return $this->success($data);
    }

    public function store(StoreOfficeNotifyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = OfficeNotify::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                $companyKey = [];
                foreach ($kids as $v) {
                    if (! in_array($v['company_id'], $companyKey)) {
                        $record->officeNotifyScope()->create([
                            'company_name' => $v['company_name'] ?? null,
                            'company_id' => $v['company_id'] ?? null,
                            'company_group_name' => $v['company_group_name'] ?? null,
                            'company_group_id' => $v['company_group_id'] ?? null,
                            'user_id' => auth()->id() ?? 0,
                            'last_user_id' => auth()->id() ?? 0,
                        ]);
                        $companyKey[] = $v['company_id'];
                    }
                }
            }

            return $record->load('officeNotifyScope');
        });

        return $this->success($result);
    }

    public function update(UpdateOfficeNotifyRequest $request, int $id): JsonResponse
    {
        $record = OfficeNotify::find($id);

        if (! $record) {
            return $this->notFound('通知公告不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                OfficeNotifyScope::where('office_notify_id', $record->id)->delete();
                $companyKey = [];
                foreach ($kids as $v) {
                    if (! in_array($v['company_id'], $companyKey)) {
                        $record->officeNotifyScope()->create([
                            'company_name' => $v['company_name'] ?? null,
                            'company_id' => $v['company_id'] ?? null,
                            'company_group_name' => $v['company_group_name'] ?? null,
                            'company_group_id' => $v['company_group_id'] ?? null,
                            'user_id' => auth()->id() ?? 0,
                            'last_user_id' => auth()->id() ?? 0,
                        ]);
                        $companyKey[] = $v['company_id'];
                    }
                }
            }

            return $record->load('officeNotifyScope');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = OfficeNotify::find($id);

        if (! $record) {
            return $this->notFound('通知公告不存在');
        }

        DB::transaction(function () use ($record) {
            $record->officeNotifyScope()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }

    /**
     * 企业端仪表板：本企业尚未反馈的任务型通知.
     */
    public function pendingNotices(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = OfficeNotifyScope::query()
            ->where('company_id', $request->company_id)
            ->where(function ($q) {
                $q->whereNull('feedback_status')
                    ->orWhere('feedback_status', '!=', '已反馈');
            })
            ->with(['officeNotify:id,name,comment,feedback_time,alert_others,annex_url,excel_url'])
            ->orderByDesc('id')
            ->get();

        return $this->success($list);
    }

    /**
     * 企业端提交任务反馈（上传附件并标记反馈状态）。
     */
    public function submitFeedback(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'feedback_annex_url' => 'required|string',
        ]);

        $scope = OfficeNotifyScope::find($id);

        if (! $scope) {
            return $this->notFound('通知反馈记录不存在');
        }

        $scope->update([
            'feedback_annex_url' => $request->input('feedback_annex_url'),
            'feedback_time' => now()->toDateString(),
            'feedback_status' => '已反馈',
            'last_user_id' => auth()->id() ?? 0,
        ]);

        return $this->success($scope->fresh());
    }
}
