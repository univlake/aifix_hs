<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ChangeManage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChangeManageController extends Controller
{
    /**
     * 变更管理列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = ChangeManage::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 变更管理详情
     */
    public function show(int $id): JsonResponse
    {
        $record = ChangeManage::find($id);

        if (!$record) {
            return $this->notFound('变更管理不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建变更管理
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'title' => 'nullable|string|max:255',
            'department_name' => 'nullable|string|max:255',
            'apply_date' => 'nullable|date',
            'reason' => 'nullable|string',
            'apply_leader_opinion' => 'nullable|string',
            'apply_leader_opinion_date' => 'nullable|date',
            'risk_analyze' => 'nullable|string',
            'manage_leader_opinion' => 'nullable|string',
            'manage_leader_opinion_date' => 'nullable|date',
            'approve' => 'nullable|string',
            'approve_date' => 'nullable|date',
            'acceptance_info' => 'nullable|string',
            'acceptance_info_date' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ChangeManage::create($data);

        return $this->success($record);
    }

    /**
     * 更新变更管理
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = ChangeManage::find($id);

        if (!$record) {
            return $this->notFound('变更管理不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'title' => 'nullable|string|max:255',
            'department_name' => 'nullable|string|max:255',
            'apply_date' => 'nullable|date',
            'reason' => 'nullable|string',
            'apply_leader_opinion' => 'nullable|string',
            'apply_leader_opinion_date' => 'nullable|date',
            'risk_analyze' => 'nullable|string',
            'manage_leader_opinion' => 'nullable|string',
            'manage_leader_opinion_date' => 'nullable|date',
            'approve' => 'nullable|string',
            'approve_date' => 'nullable|date',
            'acceptance_info' => 'nullable|string',
            'acceptance_info_date' => 'nullable|date',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除变更管理
     */
    public function destroy(int $id): JsonResponse
    {
        $record = ChangeManage::find($id);

        if (!$record) {
            return $this->notFound('变更管理不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
