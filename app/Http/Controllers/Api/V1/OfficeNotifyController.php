<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with('officeNotifyScope')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = OfficeNotify::with('officeNotifyScope')->find($id);

        if (!$data) {
            return $this->notFound('通知公告不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'required|string|max:255',
            'feedback_time' => 'nullable|date',
            'alert_others' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'annex_url' => 'nullable|string',
            'excel_url' => 'nullable|string',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = OfficeNotify::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                $companyKey = [];
                foreach ($kids as $v) {
                    if (!in_array($v['company_id'], $companyKey)) {
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

    public function update(Request $request, int $id): JsonResponse
    {
        $record = OfficeNotify::find($id);

        if (!$record) {
            return $this->notFound('通知公告不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'sometimes|required|string|max:255',
            'feedback_time' => 'sometimes|nullable|date',
            'alert_others' => 'sometimes|nullable|string|max:255',
            'comment' => 'sometimes|nullable|string',
            'annex_url' => 'sometimes|nullable|string',
            'excel_url' => 'sometimes|nullable|string',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                OfficeNotifyScope::where('office_notify_id', $record->id)->delete();
                $companyKey = [];
                foreach ($kids as $v) {
                    if (!in_array($v['company_id'], $companyKey)) {
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

        if (!$record) {
            return $this->notFound('通知公告不存在');
        }

        DB::transaction(function () use ($record) {
            $record->officeNotifyScope()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
