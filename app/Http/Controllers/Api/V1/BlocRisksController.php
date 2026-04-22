<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\MonthlyInvestigation;
use App\Models\RiskLog;
use App\Traits\ApiTree;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class BlocRisksController extends Controller
{
    use ApiTree;

    // 获取集团固有风险指数
    public function getInherentRiskNum(Request $request)
    {
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->whereNotNull('inherent_risk_grade')->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);

        $inherent = Company::query()->whereIn('id', $company_ids)->select('inherent_risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(inherent_risk) as inherent_risk'))->groupBy('inherent_risk_grade')->get();
        $count_num = Company::query()->whereIn('id', $company_ids)->whereNotNull('inherent_risk_grade')->count();
        $risk_count_num = 0;
        if ($count_num) {
            foreach ($inherent as $item) {
                // 计算风险值
                $risk_count_num += $item->inherent_risk / $item->num * ($item->num / $count_num);
            }
        }
        if ($risk_count_num < 5) {
            $inherent_risk_grade = '红';
        } elseif ($risk_count_num < 10) {
            $inherent_risk_grade = '橙';
        } elseif ($risk_count_num < 15) {
            $inherent_risk_grade = '黄';
        } else {
            $inherent_risk_grade = '蓝';
        }

        return $this->success(['inherent_risk' => round($risk_count_num, 2), 'inherent_risk_grade' => $inherent_risk_grade]);
    }

    // 获取集团动态风险指数
    public function getFloatRiskNum(Request $request)
    {
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->whereNotNull('float_risk_grade')->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);
        $inherent = Company::query()->whereIn('id', $company_ids)->select('float_risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(float_risk) as float_risk'))->groupBy('float_risk_grade')->get();
        $count_num = Company::query()->whereIn('id', $company_ids)->whereNotNull('float_risk_grade')->count();

        $risk_count_num = 0;
        if ($count_num) {
            foreach ($inherent as $item) {
                // 计算风险值
                $risk_count_num += $item->float_risk / $item->num * ($item->num / $count_num);
            }
        }

        if ($risk_count_num < 5) {
            $float_risk_grade = '红';
        } elseif ($risk_count_num < 10) {
            $float_risk_grade = '橙';
        } elseif ($risk_count_num < 15) {
            $float_risk_grade = '黄';
        } else {
            $float_risk_grade = '蓝';
        }

        return $this->success(['float_risk' => round($risk_count_num, 2), 'float_risk_grade' => $float_risk_grade]);
    }

    // 集团端风险检测中的风险等级饼状图
    public function floatRiskStatistics(Request $request)
    {
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->whereNotNull('float_risk_grade')->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);
        $inherent = Company::query()->whereIn('id', $company_ids)->when($request->enterprise_type_id != '', function ($query) use ($request) {
            $query->where('enterprise_type_id', $request->enterprise_type_id);
        })->select('float_risk_grade', DB::raw('count(*) as num'))->groupBy('float_risk_grade')->get();

        return $this->success($inherent->toArray());
    }

    // 集团端风险检测中的风险等级饼状图
    public function inherentRiskStatistics(Request $request)
    {
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->whereNotNull('inherent_risk_grade')->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);
        $inherent = Company::query()->whereIn('id', $company_ids)->when($request->enterprise_type_id != '', function ($query) use ($request) {
            $query->where('enterprise_type_id', $request->enterprise_type_id);
        })->select('inherent_risk_grade', DB::raw('count(*) as num'))->groupBy('inherent_risk_grade')->get();

        return $this->success($inherent->toArray());
    }

    // 集团段风险指数变化图（最近 7 天）
    public function getRiskLog(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required',
        ], [
            'company_id.required' => '企业id不能为空',
        ]);
        if ($validator->fails()) {
            return $this->failed($validator->errors()->first());
        }

        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);
        $count_num = count($company_ids);

        // Build the 7 day-codes (oldest first → today last) the chart needs.
        $dates = [];
        for ($i = 6; $i >= 0; $i--) {
            $dates[] = date('Ymd', strtotime("-{$i} days"));
        }

        // Two bulk queries (one per type) covering all 7 days, grouped by date+grade.
        // Replaces 14 separate single-day queries the legacy version issued.
        $rows = RiskLog::query()
            ->whereIn('company_id', $company_ids)
            ->whereIn('date', $dates)
            ->select('date', 'type', 'risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))
            ->groupBy(['date', 'type', 'risk_grade'])
            ->get();

        // Bucket by date+type for O(1) lookup.
        $bucketed = [];
        foreach ($rows as $row) {
            $bucketed[(int) $row->date][(int) $row->type][] = $row;
        }

        $data = [];
        foreach ($dates as $idx => $dateCode) {
            $inherentRows = collect($bucketed[(int) $dateCode][1] ?? []);
            $floatRows = collect($bucketed[(int) $dateCode][2] ?? []);

            [$inherentNum, $inherentGrade] = $this->calculate($inherentRows, $count_num);
            [$floatNum, $floatGrade] = $this->calculate($floatRows, $count_num);

            $data[$idx] = [
                'title' => $dateCode,
                'inherent_risk_num' => $inherentNum,
                'inherent_risk_grade' => $inherentGrade,
                'float_risk_num' => $floatNum,
                'float_risk_grade' => $floatGrade,
            ];
        }

        return $this->success($data);
    }

    public function calculate($raw_data, $count_num)
    {
        $risk_count_num = 0;
        foreach ($raw_data as $item) {
            // 计算风险值
            $risk_count_num += $item->risk_num / $item->num * ($item->num / $count_num);
        }
        $risk_count_num = round($risk_count_num, 2);
        if ($risk_count_num < 5) {
            $float_risk_grade = '红';
        } elseif ($risk_count_num < 10 && $risk_count_num >= 5) {
            $float_risk_grade = '橙';
        } elseif ($risk_count_num < 15 && $risk_count_num >= 10) {
            $float_risk_grade = '黄';
        } else {
            $float_risk_grade = '蓝';
        }

        return [$risk_count_num, $float_risk_grade];
    }

    // 企业风险分值排序
    public function riskSort(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required',
            'type' => 'required',
        ], [
            'company_id.required' => '企业id不能为空',
            'type.required' => '类型不能为空',
        ]
        );
        if ($validator->fails()) {
            return $this->failed($validator->errors()->first());
        }
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);

        $data = RiskLog::query()->whereIn('company_id', $company_ids)
            ->where('type', $request->type)->orderBy('risk_num', 'desc')->where('date', date('Ymd'))->get()->toArray();

        return ['status_code' => 200, 'data' => $data];
    }

    // 企业整改排序
    public function hiddenDangerSort(Request $request)
    {
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);

        if (empty($company_ids)) {
            return $this->success([]);
        }

        $today = date('Y-m-d');

        // Single conditional-aggregate query covering all 4 stats per company.
        // Replaces 4N queries (4 per company in the legacy loop).
        $stats = MonthlyInvestigation::query()
            ->whereIn('company_id', $company_ids)
            ->select(
                'company_id',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN updated_at NOT LIKE '{$today}%' THEN 1 ELSE 0 END) as total_old"),
                DB::raw("SUM(CASE WHEN correct_result = '已整改' THEN 1 ELSE 0 END) as resolved"),
                DB::raw("SUM(CASE WHEN correct_result = '已整改' AND updated_at NOT LIKE '{$today}%' THEN 1 ELSE 0 END) as resolved_old"),
            )
            ->groupBy('company_id')
            ->get()
            ->keyBy('company_id');

        // Single titles lookup instead of one Company::value() per company.
        $titles = Company::query()->whereIn('id', $company_ids)->pluck('title', 'id');

        $data = [];
        foreach ($company_ids as $k => $cid) {
            $row = $stats->get($cid);
            $total = (int) ($row->total ?? 0);
            $totalOld = (int) ($row->total_old ?? 0);
            $resolved = (int) ($row->resolved ?? 0);
            $resolvedOld = (int) ($row->resolved_old ?? 0);

            $scale = ($total && $resolved) ? round($resolved / $total, 2) * 100 : 0;
            $jqr = ($totalOld && $resolvedOld)
                ? $scale - round($resolvedOld / $totalOld, 2) * 100
                : 0;

            $data[$k] = [
                'company_name' => (string) ($titles[$cid] ?? ''),
                'monthly_investigation_scale' => $scale,
                'jqr' => $jqr,
                'company_id' => $cid,
            ];
        }

        $monthly_investigation_scale = array_column($data, 'monthly_investigation_scale');
        array_multisort($monthly_investigation_scale, SORT_DESC, $data);

        return $this->success($data);
    }
}
