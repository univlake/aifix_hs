<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RegulationLibraryType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RegulationLibraryTypeController extends Controller
{
    /**
     * 法规类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = RegulationLibraryType::query()
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建法规类型
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $type = RegulationLibraryType::create($data);

        return $this->success($type);
    }

    /**
     * 更新法规类型
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $type = RegulationLibraryType::find($id);

        if (!$type) {
            return $this->notFound('法规类型不存在');
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除法规类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = RegulationLibraryType::find($id);

        if (!$type) {
            return $this->notFound('法规类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
