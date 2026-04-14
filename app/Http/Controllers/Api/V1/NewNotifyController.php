<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\NewNotify;
use App\Models\NewNotifyScope;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreNewNotifyRequest;
use App\Http\Requests\Api\V1\UpdateNewNotifyRequest;

class NewNotifyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NewNotify::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->with('newNotifyScope')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = NewNotify::with('newNotifyScope')->find($id);

        if (!$data) {
            return $this->notFound('新通知不存在');
        }

        return $this->success($data);
    }

    public function store(StoreNewNotifyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $record = NewNotify::create($data);

            $kids = $request->input('kids');
            if ($kids) {
                $companyKey = [];
                foreach ($kids as $v) {
                    if (!in_array($v['company_id'], $companyKey)) {
                        $record->newNotifyScope()->create([
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

            return $record->load('newNotifyScope');
        });

        return $this->success($result);
    }

    public function update(UpdateNewNotifyRequest $request, int $id): JsonResponse
    {
        $record = NewNotify::find($id);

        if (!$record) {
            return $this->notFound('新通知不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $record, $data) {
            $record->update($data);

            $kids = $request->input('kids');
            if ($kids) {
                NewNotifyScope::where('new_notify_id', $record->id)->delete();
                $companyKey = [];
                foreach ($kids as $v) {
                    if (!in_array($v['company_id'], $companyKey)) {
                        $record->newNotifyScope()->create([
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

            return $record->load('newNotifyScope');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = NewNotify::find($id);

        if (!$record) {
            return $this->notFound('新通知不存在');
        }

        DB::transaction(function () use ($record) {
            $record->newNotifyScope()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
