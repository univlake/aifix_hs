<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreFireFacilityRequest;
use App\Http\Requests\Api\V1\UpdateFireFacilityRequest;
use App\Models\FireFacility;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FireFacilityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FireFacility::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('equipment_name')) {
            $query->where('equipment_name', 'like', '%'.$request->equipment_name.'%');
        }

        if ($request->filled('special_type')) {
            $query->where('special_type', 'like', '%'.$request->special_type.'%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = FireFacility::find($id);

        if (! $data) {
            return $this->notFound('消防设施不存在');
        }

        return $this->success($data);
    }

    public function store(StoreFireFacilityRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = FireFacility::create($data);

        return $this->success($record);
    }

    public function update(UpdateFireFacilityRequest $request, int $id): JsonResponse
    {
        $record = FireFacility::find($id);

        if (! $record) {
            return $this->notFound('消防设施不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = FireFacility::find($id);

        if (! $record) {
            return $this->notFound('消防设施不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    public function copy(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer',
        ]);

        $originals = FireFacility::whereIn('id', $request->ids)->get();

        if ($originals->isEmpty()) {
            return $this->notFound('未找到指定记录');
        }

        $newIds = [];
        foreach ($originals as $original) {
            $data = $original->only([
                'equipment_name', 'utilized_location', 'special_type',
                'use_time', 'automation_type', 'maintain_info', 'comment', 'company_id',
            ]);
            $data['user_id'] = auth()->id() ?? 0;
            $data['last_user_id'] = auth()->id() ?? 0;

            $newIds[] = FireFacility::create($data)->id;
        }

        return $this->success(['ids' => $newIds, 'count' => count($newIds)]);
    }
}
