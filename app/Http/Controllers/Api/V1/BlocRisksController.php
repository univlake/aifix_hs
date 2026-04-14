<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\BlocRisks;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BlocRisksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Placeholder: aggregation across company tree
        return $this->success([]);
    }

    public function getInherentRiskNum(Request $request): JsonResponse
    {
        return $this->success(['inherent_risk' => 0, 'inherent_risk_grade' => '蓝']);
    }

    public function getFloatRiskNum(Request $request): JsonResponse
    {
        return $this->success(['float_risk' => 0, 'float_risk_grade' => '蓝']);
    }

    public function floatRiskStatistics(Request $request): JsonResponse
    {
        return $this->success([]);
    }

    public function inherentRiskStatistics(Request $request): JsonResponse
    {
        return $this->success([]);
    }

    public function getRiskLog(Request $request): JsonResponse
    {
        return $this->success([]);
    }

    public function riskSort(Request $request): JsonResponse
    {
        return $this->success([]);
    }

    public function hiddenDangerSort(Request $request): JsonResponse
    {
        return $this->success([]);
    }
}
