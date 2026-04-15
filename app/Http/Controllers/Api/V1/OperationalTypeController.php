<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreOperationalTypeRequest;
use App\Http\Requests\Api\V1\UpdateOperationalTypeRequest;
use App\Models\OperationalType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OperationalTypeController extends Controller
{
    /**
     * 经营类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = OperationalType::query()
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建经营类型
     */
    public function store(StoreOperationalTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = OperationalType::create($data);

        return $this->success($type);
    }

    /**
     * 更新经营类型
     */
    public function update(UpdateOperationalTypeRequest $request, int $id): JsonResponse
    {
        $type = OperationalType::find($id);

        if (! $type) {
            return $this->notFound('经营类型不存在');
        }

        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除经营类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = OperationalType::find($id);

        if (! $type) {
            return $this->notFound('经营类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
