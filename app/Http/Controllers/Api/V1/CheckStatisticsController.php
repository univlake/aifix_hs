<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CorrectionResult;
use App\Http\Controllers\Api\Controller;
use App\Models\AccidentCheck;
use App\Models\AddPoint;
use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\DoubleCheck;
use App\Models\MonthlyInvestigation;
use App\Models\NormCheck;
use App\Models\SpecialEquipment;
use App\Models\SpecialEquipmentStaff;
use App\Models\SystemCheck;
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

    /**
     * Return alert counts for a company and all its subordinates:
     * - expired personnel certificates
     * - expired special equipment
     * - unrevised hazards (MonthlyInvestigation where correct_result != CorrectionResult::Rectified)
     */
    public function alerts(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyId = (int) $request->company_id;

        // Collect all descendant company IDs including the given company
        $ids = $this->allDescendantIds($companyId);

        $today = now()->toDateString();

        $expiredStaff = SpecialEquipmentStaff::query()
            ->whereIn('company_id', $ids)
            ->where('valid_period', '<', $today)
            ->count();

        $expiredEquipment = SpecialEquipment::query()
            ->whereIn('company_id', $ids)
            ->where('valid_period', '<', $today)
            ->count();

        $unrevisedHazards = MonthlyInvestigation::query()
            ->whereIn('company_id', $ids)
            ->where('correct_result', '!=', CorrectionResult::Rectified->value)
            ->count();

        return $this->success([
            'expired_staff_certs' => $expiredStaff,
            'expired_equipment' => $expiredEquipment,
            'unrevised_hazards' => $unrevisedHazards,
        ]);
    }

    /**
     * Return IDs of the given company plus all its descendants.
     *
     * @return int[]
     */
    private function allDescendantIds(int $companyId): array
    {
        $ids = [$companyId];
        $this->collectChildIds($companyId, $ids);

        return $ids;
    }

    private function collectChildIds(int $parentId, array &$ids): void
    {
        $children = Company::query()->where('pid', $parentId)->pluck('id');
        foreach ($children as $childId) {
            $ids[] = $childId;
            $this->collectChildIds($childId, $ids);
        }
    }
}
