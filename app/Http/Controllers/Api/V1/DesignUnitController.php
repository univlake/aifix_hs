<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DesignUnit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreDesignUnitRequest;
use App\Http\Requests\Api\V1\UpdateDesignUnitRequest;

class DesignUnitController extends Controller
{
    /**
     * 设计单位列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = DesignUnit::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 设计单位详情
     */
    public function show(int $id): JsonResponse
    {
        $record = DesignUnit::find($id);

        if (!$record) {
            return $this->notFound('设计单位不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建设计单位
     */
    public function store(StoreDesignUnitRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = DesignUnit::create($data);

        return $this->success($record);
    }

    /**
     * 更新设计单位
     */
    public function update(UpdateDesignUnitRequest $request, int $id): JsonResponse
    {
        $record = DesignUnit::find($id);

        if (!$record) {
            return $this->notFound('设计单位不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除设计单位
     */
    public function destroy(int $id): JsonResponse
    {
        $record = DesignUnit::find($id);

        if (!$record) {
            return $this->notFound('设计单位不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
