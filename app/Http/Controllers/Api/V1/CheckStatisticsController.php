<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\DailyCheck;
use App\Models\DoubleCheck;
use App\Models\SystemCheck;
use App\Models\NormCheck;
use App\Models\AccidentCheck;
use App\Models\AddPoint;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CheckStatisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer',
        ]);

        $companyId = $request->company_id;
        $year = $request->year;

        // 日常检查得分
        $dailySum = DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        // 双重预防检查得分
        $doubleSum = DoubleCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        // 系统考核得分
        $systemSum = SystemCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        // 标准化检查得分
        $normSum = NormCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        // 事故检查得分
        $accidentSum = AccidentCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        // 加分项得分
        $addPointsSum = AddPoint::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->sum('number');

        return $this->success([
            'company_id' => $companyId,
            'year' => $year,
            'daily_check_sum' => (float) $dailySum,
            'double_check_sum' => (float) $doubleSum,
            'system_check_sum' => (float) $systemSum,
            'norm_check_sum' => (float) $normSum,
            'accident_check_sum' => (float) $accidentSum,
            'add_points_sum' => (float) $addPointsSum,
            'total' => round(
                (float) $dailySum
                + (float) $doubleSum
                + (float) $systemSum
                + (float) $normSum
                + (float) $accidentSum
                + (float) $addPointsSum,
                2
            ),
        ]);
    }
}
