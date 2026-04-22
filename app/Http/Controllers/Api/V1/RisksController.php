<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\FloatRiskLog;
use App\Models\InherentRiskLog;
use App\Models\RiskLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RisksController extends Controller
{
    /**
     * 企业风险画像
     */
    public function portrait(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $company = Company::query()->find($request->company_id);
        if (! $company) {
            return $this->notFound('企业不存在');
        }

        $inherentLog = InherentRiskLog::query()
            ->where('company_id', $request->company_id)
            ->orderByDesc('created_at')
            ->first();

        $floatLog = FloatRiskLog::query()
            ->where('company_id', $request->company_id)
            ->orderByDesc('created_at')
            ->first();

        if (! $inherentLog || ! $floatLog) {
            return $this->success([]);
        }

        // TODO: 完善风险计算逻辑
        return $this->success([
            'inherent_risk_log' => $inherentLog,
            'float_risk_log' => $floatLog,
            'risk_log' => RiskLog::query()
                ->where('company_id', $request->company_id)
                ->orderByDesc('created_at')
                ->first(),
        ]);
    }

    /**
     * 风险日志列表
     */
    public function riskLog(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $list = RiskLog::query()
            ->where('company_id', $request->company_id)
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }
}
