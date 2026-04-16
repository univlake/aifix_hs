<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\SpecialEquipment;
use App\Models\SpecialType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SpecialEquipmentStatisticsController extends Controller
{
    /**
     * 特种设备数据统计 — 按下属企业和设备类型汇总数量
     *
     * @param  Request  $request  company_id: 集团根企业ID
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate(['company_id' => 'required|integer']);

        $companyId = (int) $request->company_id;

        // 获取直属下属企业
        $subCompanies = Company::query()
            ->where('pid', $companyId)
            ->where('status', 1)
            ->orderBy('id')
            ->get(['id', 'title']);

        // 如无下属企业，则以该企业自身统计
        if ($subCompanies->isEmpty()) {
            $subCompanies = Company::query()
                ->where('id', $companyId)
                ->get(['id', 'title']);
        }

        $companyIds = $subCompanies->pluck('id')->toArray();

        // 所有特种设备类型
        $types = SpecialType::query()
            ->orderBy('id')
            ->get(['id', 'title']);

        // 按 company_id + special_type_id 统计数量
        $raw = SpecialEquipment::query()
            ->whereIn('company_id', $companyIds)
            ->selectRaw('company_id, special_type_id, COUNT(*) as count')
            ->groupBy('company_id', 'special_type_id')
            ->get()
            ->groupBy('company_id');

        $rows = $subCompanies->map(function (Company $company) use ($raw, $types) {
            $byType = $raw->get($company->id, collect())->keyBy('special_type_id');

            $counts = $types->mapWithKeys(function (SpecialType $type) use ($byType) {
                return [(string) $type->id => (int) ($byType->get($type->id)?->count ?? 0)];
            });

            return [
                'company_id' => $company->id,
                'company_title' => $company->title,
                'counts' => $counts,
                'total' => $counts->sum(),
            ];
        });

        return $this->success([
            'types' => $types,
            'rows' => $rows,
        ]);
    }
}
