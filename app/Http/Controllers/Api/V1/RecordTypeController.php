<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreRecordTypeRequest;
use App\Http\Requests\Api\V1\UpdateRecordTypeRequest;
use App\Models\RecordType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecordTypeController extends Controller
{
    /**
     * 备案/许可类型列表
     */
    public function index(Request $request): JsonResponse
    {
        $list = RecordType::query()
            ->orderBy('id', 'asc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 创建备案/许可类型
     */
    public function store(StoreRecordTypeRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $type = RecordType::create($data);

        return $this->success($type);
    }

    /**
     * 更新备案/许可类型
     */
    public function update(UpdateRecordTypeRequest $request, int $id): JsonResponse
    {
        $type = RecordType::find($id);

        if (! $type) {
            return $this->notFound('备案/许可类型不存在');
        }

        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $type->update($data);

        return $this->success($type->fresh());
    }

    /**
     * 删除备案/许可类型
     */
    public function destroy(int $id): JsonResponse
    {
        $type = RecordType::find($id);

        if (! $type) {
            return $this->notFound('备案/许可类型不存在');
        }

        $type->delete();

        return $this->message('删除成功');
    }
}
