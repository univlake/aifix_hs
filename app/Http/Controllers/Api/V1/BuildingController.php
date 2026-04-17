<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreBuildingRequest;
use App\Http\Requests\Api\V1\UpdateBuildingRequest;
use App\Models\Building;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BuildingController extends Controller
{
    /**
     * 建筑列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = Building::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 建筑详情
     */
    public function show(int $id): JsonResponse
    {
        $building = Building::find($id);

        if (! $building) {
            return $this->notFound('建筑不存在');
        }

        return $this->success($building);
    }

    /**
     * 创建建筑
     */
    public function store(StoreBuildingRequest $request): JsonResponse
    {
        if ($this->isGroupAccount()) {
            return $this->failed('集团账号不允许创建数据', 403);
        }

        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $building = Building::create($data);

        return $this->success($building);
    }

    /**
     * 更新建筑
     */
    public function update(UpdateBuildingRequest $request, int $id): JsonResponse
    {
        if ($this->isGroupAccount()) {
            return $this->failed('集团账号不允许修改数据', 403);
        }

        $building = Building::find($id);

        if (! $building) {
            return $this->notFound('建筑不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $building->update($data);

        return $this->success($building->fresh());
    }

    /**
     * 删除建筑
     */
    public function destroy(int $id): JsonResponse
    {
        if ($this->isGroupAccount()) {
            return $this->failed('集团账号不允许删除数据', 403);
        }

        $building = Building::find($id);

        if (! $building) {
            return $this->notFound('建筑不存在');
        }

        $building->delete();

        return $this->message('删除成功');
    }

    private function isGroupAccount(): bool
    {
        return (bool) auth()->user()?->company?->is_bloc;
    }
}
