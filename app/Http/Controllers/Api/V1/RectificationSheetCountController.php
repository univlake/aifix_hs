<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RectificationSheetCountController extends Controller
{
    /**
     * 整改统计
     * TODO: 完善统计逻辑
     */
    public function getStatistics(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        // Placeholder — 返回空统计数据
        return $this->success([
            'total' => 0,
            'rectified' => 0,
            'pending' => 0,
            'overdue' => 0,
        ]);
    }
}
