<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentBulletin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * TODO(2026-04-22): 本控制器当前没有前端调用方（审计 docs/followup-audit.md 步骤 3 标记为「保留 TODO」）。
 * 计划用途：为集团仪表盘提供「自上次事故以来安全生产天数」小卡片。
 * 如在后续迭代中确认不需要，请随 /visible、/risk-max-values 一并移除。
 */
class BlocCommentsController extends Controller
{
    public function getInfo(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'type' => 'required|string',
        ]);

        // Calculate safe production days since last fatal accident
        $oldTime = AccidentBulletin::query()
            ->where('company_id', $request->company_id)
            ->where('staff_die', '>', 0)
            ->orderByDesc('created_at')
            ->value('created_at') ?? '2023-01-01';

        $days = (int) ceil((time() - strtotime($oldTime)) / 86400);
        $day1 = 24 - (int) date('d');

        if ($day1 >= 0) {
            $data = "自系统运行，已安全生产{$days}天；距离下次月报提交还有{$day1}天；";
        } else {
            $data = "自系统运行，已安全生产{$days}天；";
        }

        return $this->success($data);
    }
}
