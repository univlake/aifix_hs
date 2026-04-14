<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskMaxValue;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreRiskMaxValueRequest;
use App\Http\Requests\Api\V1\UpdateRiskMaxValueRequest;

class RiskMaxValueController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RiskMaxValue::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        $data = $query->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = RiskMaxValue::find($id);

        if (!$data) {
            return $this->notFound('风险最大值不存在');
        }

        return $this->success($data);
    }

    public function store(StoreRiskMaxValueRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskMaxValue = RiskMaxValue::create($data);

        return $this->success($riskMaxValue);
    }

    public function update(UpdateRiskMaxValueRequest $request, int $id): JsonResponse
    {
        $riskMaxValue = RiskMaxValue::find($id);

        if (!$riskMaxValue) {
            return $this->notFound('风险最大值不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $riskMaxValue->update($data);

        return $this->success($riskMaxValue->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $riskMaxValue = RiskMaxValue::find($id);

        if (!$riskMaxValue) {
            return $this->notFound('风险最大值不存在');
        }

        $riskMaxValue->delete();

        return $this->message('删除成功');
    }
}
