<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreFireSafetyRequest;
use App\Http\Requests\Api\V1\UpdateFireSafetyRequest;
use App\Models\FireSafety;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FireSafetyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FireSafety::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%'.$request->name.'%');
        }

        $list = $query->with(['skillUnit', 'skillUnitKid'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = FireSafety::with(['skillUnit', 'skillUnitKid'])->find($id);

        if (! $data) {
            return $this->notFound('消防管理不存在');
        }

        return $this->success($data);
    }

    public function store(StoreFireSafetyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FireSafety::create($data);

        return $this->success($record);
    }

    public function update(UpdateFireSafetyRequest $request, int $id): JsonResponse
    {
        $record = FireSafety::find($id);

        if (! $record) {
            return $this->notFound('消防管理不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FireSafety::find($id);

        if (! $record) {
            return $this->notFound('消防管理不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
