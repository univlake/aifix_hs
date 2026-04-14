<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\ProductionStandardization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreProductionStandardizationRequest;
use App\Http\Requests\Api\V1\UpdateProductionStandardizationRequest;

class ProductionStandardizationController extends Controller
{
    /**
     * 安全生产标准化（只返回第一条）
     */
    public function index(Request $request): JsonResponse
    {
        $record = ProductionStandardization::query()
            ->where('company_id', $request->get('company_id'))
            ->first();

        return $this->success($record);
    }

    /**
     * 创建安全生产标准化
     */
    public function store(StoreProductionStandardizationRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = ProductionStandardization::create($data);

        return $this->success($record);
    }

    /**
     * 更新安全生产标准化
     */
    public function update(UpdateProductionStandardizationRequest $request, int $id): JsonResponse
    {
        $record = ProductionStandardization::find($id);

        if (!$record) {
            return $this->notFound('安全生产标准化不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }
}
