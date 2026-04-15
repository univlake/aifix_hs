<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreEnterpriseTypeRequest;
use App\Http\Requests\Api\V1\UpdateEnterpriseTypeRequest;
use App\Models\EnterpriseType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnterpriseTypeController extends Controller
{
    /**
     * 企业类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = EnterpriseType::query()
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建企业类型
     */
    public function store(StoreEnterpriseTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = EnterpriseType::create($data);

        return $this->success($type);
    }

    /**
     * 更新企业类型
     */
    public function update(UpdateEnterpriseTypeRequest $request, int $id): JsonResponse
    {
        $type = EnterpriseType::find($id);

        if (! $type) {
            return $this->notFound('企业类型不存在');
        }

        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除企业类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = EnterpriseType::find($id);

        if (! $type) {
            return $this->notFound('企业类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
