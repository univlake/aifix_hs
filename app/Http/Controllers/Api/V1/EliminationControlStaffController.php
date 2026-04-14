<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\EliminationControlStaff;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreEliminationControlStaffRequest;
use App\Http\Requests\Api\V1\UpdateEliminationControlStaffRequest;

class EliminationControlStaffController extends Controller
{
    /**
     * 淘汰控制人员列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = EliminationControlStaff::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 淘汰控制人员详情
     */
    public function show(int $id): JsonResponse
    {
        $record = EliminationControlStaff::find($id);

        if (!$record) {
            return $this->notFound('淘汰控制人员不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建淘汰控制人员
     */
    public function store(StoreEliminationControlStaffRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = EliminationControlStaff::create($data);

        return $this->success($record);
    }

    /**
     * 更新淘汰控制人员
     */
    public function update(UpdateEliminationControlStaffRequest $request, int $id): JsonResponse
    {
        $record = EliminationControlStaff::find($id);

        if (!$record) {
            return $this->notFound('淘汰控制人员不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除淘汰控制人员
     */
    public function destroy(int $id): JsonResponse
    {
        $record = EliminationControlStaff::find($id);

        if (!$record) {
            return $this->notFound('淘汰控制人员不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
