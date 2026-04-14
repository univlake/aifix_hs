<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\RiskDistributionMap;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'annex_url' => 'nullable|string',
            'company_id' => 'required|integer',
        ]);

        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $riskDistributionMap = RiskDistributionMap::create($data);

        return $this->success($riskDistributionMap);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $riskDistributionMap = RiskDistributionMap::find($id);

        if (!$riskDistributionMap) {
            return $this->notFound('风险分布图不存在');
        }

        $data = $request->validate([
            'annex_url' => 'sometimes|nullable|string',
            'company_id' => 'sometimes|nullable|integer',
        ]);

        $data['last_user_id'] = auth()->id() ?? 0;
        $riskDistributionMap->update($data);

        return $this->success($riskDistributionMap->fresh());
    }
}
