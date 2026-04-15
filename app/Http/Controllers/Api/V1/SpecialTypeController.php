<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSpecialTypeRequest;
use App\Http\Requests\Api\V1\UpdateSpecialTypeRequest;
use App\Models\SpecialType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpecialTypeController extends Controller
{
    /**
     * 设备类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = SpecialType::query()
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建设备类型
     */
    public function store(StoreSpecialTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = SpecialType::create($data);

        return $this->success($type);
    }

    /**
     * 更新设备类型
     */
    public function update(UpdateSpecialTypeRequest $request, int $id): JsonResponse
    {
        $type = SpecialType::find($id);

        if (! $type) {
            return $this->notFound('设备类型不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除设备类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = SpecialType::find($id);

        if (! $type) {
            return $this->notFound('设备类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
