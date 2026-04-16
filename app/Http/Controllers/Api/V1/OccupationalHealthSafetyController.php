<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreOccupationalHealthSafetyRequest;
use App\Http\Requests\Api\V1\UpdateOccupationalHealthSafetyRequest;
use App\Models\OccupationalHealthSafety;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OccupationalHealthSafetyController extends Controller
{
    /**
     * 职业健康安全管理体系（只返回第一条）
     */
    public function index(Request $request): JsonResponse
    {
        $record = OccupationalHealthSafety::query()
            ->where('company_id', $request->get('company_id'))
            ->first();

        return $this->success($record);
    }

    /**
     * 创建职业健康安全管理体系
     */
    public function store(StoreOccupationalHealthSafetyRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = OccupationalHealthSafety::create($data);

        return $this->success($record);
    }

    /**
     * 更新职业健康安全管理体系
     */
    public function update(UpdateOccupationalHealthSafetyRequest $request, int $id): JsonResponse
    {
        $record = OccupationalHealthSafety::find($id);

        if (! $record) {
            return $this->notFound('职业健康安全管理体系不存在');
        }

        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }
}
