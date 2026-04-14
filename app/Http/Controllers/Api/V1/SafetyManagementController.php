<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\SafetyManagement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SafetyManagementController extends Controller
{
    /**
     * 安全管理人员列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = SafetyManagement::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $list = $query->with(['safetyManagementType', 'company'])
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 安全管理人员详情
     */
    public function show(int $id): JsonResponse
    {
        $record = SafetyManagement::with(['safetyManagementType', 'company'])->find($id);

        if (!$record) {
            return $this->notFound('安全管理人员不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建安全管理人员
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'safety_management_type_id' => 'nullable|integer',
            'tel' => 'nullable|string|max:255',
            'cert_title' => 'nullable|string|max:255',
            'cert_number' => 'nullable|string|max:255',
            'valid_period' => 'nullable|date',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = SafetyManagement::create($data);

        return $this->success($record);
    }

    /**
     * 更新安全管理人员
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = SafetyManagement::find($id);

        if (!$record) {
            return $this->notFound('安全管理人员不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'nullable|string|max:255',
            'safety_management_type_id' => 'nullable|integer',
            'tel' => 'nullable|string|max:255',
            'cert_title' => 'nullable|string|max:255',
            'cert_number' => 'nullable|string|max:255',
            'valid_period' => 'nullable|date',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除安全管理人员
     */
    public function destroy(int $id): JsonResponse
    {
        $record = SafetyManagement::find($id);

        if (!$record) {
            return $this->notFound('安全管理人员不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
