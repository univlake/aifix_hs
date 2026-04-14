<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
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

        if (!$building) {
            return $this->notFound('建筑不存在');
        }

        return $this->success($building);
    }

    /**
     * 创建建筑
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'title' => 'required|string|max:255',
            'area' => 'required|string|max:255',
            'fire_class' => 'required|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $building = Building::create($data);

        return $this->success($building);
    }

    /**
     * 更新建筑
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $building = Building::find($id);

        if (!$building) {
            return $this->notFound('建筑不存在');
        }

        $data = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'area' => 'sometimes|required|string|max:255',
            'fire_class' => 'sometimes|required|string|max:255',
            'company_id' => 'sometimes|required|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $building->update($data);

        return $this->success($building->fresh());
    }

    /**
     * 删除建筑
     */
    public function destroy(int $id): JsonResponse
    {
        $building = Building::find($id);

        if (!$building) {
            return $this->notFound('建筑不存在');
        }

        $building->delete();

        return $this->message('删除成功');
    }
}
