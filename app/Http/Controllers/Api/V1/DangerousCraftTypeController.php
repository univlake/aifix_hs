<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DangerousCraftType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DangerousCraftTypeController extends Controller
{
    /**
     * 危险工艺类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = DangerousCraftType::query()
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建危险工艺类型
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $type = DangerousCraftType::create($data);

        return $this->success($type);
    }

    /**
     * 更新危险工艺类型
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $type = DangerousCraftType::find($id);

        if (!$type) {
            return $this->notFound('危险工艺类型不存在');
        }

        $data = $request->validate([
            'title' => 'required|string|max:255',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除危险工艺类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = DangerousCraftType::find($id);

        if (!$type) {
            return $this->notFound('危险工艺类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
