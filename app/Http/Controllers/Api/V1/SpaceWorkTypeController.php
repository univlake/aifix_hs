<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SpaceWorkType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreSpaceWorkTypeRequest;
use App\Http\Requests\Api\V1\UpdateSpaceWorkTypeRequest;

class SpaceWorkTypeController extends Controller
{
    /**
     * 有限空间辨识类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = SpaceWorkType::query()
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建有限空间辨识类型
     */
    public function store(StoreSpaceWorkTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = SpaceWorkType::create($data);

        return $this->success($type);
    }

    /**
     * 更新有限空间辨识类型
     */
    public function update(UpdateSpaceWorkTypeRequest $request, int $id): JsonResponse
    {
        $type = SpaceWorkType::find($id);

        if (!$type) {
            return $this->notFound('有限空间辨识类型不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除有限空间辨识类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = SpaceWorkType::find($id);

        if (!$type) {
            return $this->notFound('有限空间辨识类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
