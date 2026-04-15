<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreSafetyManagementTypeRequest;
use App\Http\Requests\Api\V1\UpdateSafetyManagementTypeRequest;
use App\Models\SafetyManagementType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyManagementTypeController extends Controller
{
    /**
     * 安全管理人员类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = SafetyManagementType::query()
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建安全管理人员类型
     */
    public function store(StoreSafetyManagementTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = SafetyManagementType::create($data);

        return $this->success($type);
    }

    /**
     * 更新安全管理人员类型
     */
    public function update(UpdateSafetyManagementTypeRequest $request, int $id): JsonResponse
    {
        $type = SafetyManagementType::find($id);

        if (! $type) {
            return $this->notFound('安全管理人员类型不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除安全管理人员类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = SafetyManagementType::find($id);

        if (! $type) {
            return $this->notFound('安全管理人员类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
