<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\TrainingClassType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrainingClassTypeController extends Controller
{
    /**
     * 培训课类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = TrainingClassType::query()
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建培训课类型
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $type = TrainingClassType::create($data);

        return $this->success($type);
    }

    /**
     * 更新培训课类型
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $type = TrainingClassType::find($id);

        if (!$type) {
            return $this->notFound('培训课类型不存在');
        }

        $data = $request->validate([
            'title' => 'nullable|string|max:255',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除培训课类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = TrainingClassType::find($id);

        if (!$type) {
            return $this->notFound('培训课类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
