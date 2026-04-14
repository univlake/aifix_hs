<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ProcessType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreProcessTypeRequest;
use App\Http\Requests\Api\V1\UpdateProcessTypeRequest;

class ProcessTypeController extends Controller
{
    /**
     * 工艺名称类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = ProcessType::query()
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建工艺名称类型
     */
    public function store(StoreProcessTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = ProcessType::create($data);

        return $this->success($type);
    }

    /**
     * 更新工艺名称类型
     */
    public function update(UpdateProcessTypeRequest $request, int $id): JsonResponse
    {
        $type = ProcessType::find($id);

        if (!$type) {
            return $this->notFound('工艺名称类型不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除工艺名称类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = ProcessType::find($id);

        if (!$type) {
            return $this->notFound('工艺名称类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
