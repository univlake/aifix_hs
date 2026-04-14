<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\CertificateStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CertificateStatusController extends Controller
{
    /**
     * 持证情况列表
     */
    public function index(Request $request): JsonResponse
    {
        $query = CertificateStatus::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        } else {
            $query->where('type', 1);
        }

        $list = $query->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 持证情况详情
     */
    public function show(int $id): JsonResponse
    {
        $record = CertificateStatus::find($id);

        if (!$record) {
            return $this->notFound('持证情况不存在');
        }

        return $this->success($record);
    }

    /**
     * 创建持证情况
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|integer',
            'should_obtain_people' => 'nullable|integer',
            'already_obtain_people' => 'nullable|integer',
            'no_obtain_people' => 'nullable|string|max:255',
            'train_people' => 'nullable|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = CertificateStatus::create($data);

        return $this->success($record);
    }

    /**
     * 更新持证情况
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $record = CertificateStatus::find($id);

        if (!$record) {
            return $this->notFound('持证情况不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'name' => 'nullable|string|max:255',
            'type' => 'nullable|integer',
            'should_obtain_people' => 'nullable|integer',
            'already_obtain_people' => 'nullable|integer',
            'no_obtain_people' => 'nullable|string|max:255',
            'train_people' => 'nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    /**
     * 删除持证情况
     */
    public function destroy(int $id): JsonResponse
    {
        $record = CertificateStatus::find($id);

        if (!$record) {
            return $this->notFound('持证情况不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
