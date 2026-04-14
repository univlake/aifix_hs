<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskDistributionMap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Requests\Api\V1\StoreRiskDistributionMapRequest;
use App\Http\Requests\Api\V1\UpdateRiskDistributionMapRequest;

class RiskDistributionMapController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = null;

        if ($request->filled('company_id')) {
            $data = RiskDistributionMap::where('company_id', $request->company_id)->first();
        }

        return $this->success($data);
    }

    public function store(StoreRiskDistributionMapRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskDistributionMap = RiskDistributionMap::create($data);

        return $this->success($riskDistributionMap);
    }

    public function update(UpdateRiskDistributionMapRequest $request, int $id): JsonResponse
    {
        $riskDistributionMap = RiskDistributionMap::find($id);

        if (!$riskDistributionMap) {
            return $this->notFound('风险分布图不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $riskDistributionMap->update($data);

        return $this->success($riskDistributionMap->fresh());
    }
}
