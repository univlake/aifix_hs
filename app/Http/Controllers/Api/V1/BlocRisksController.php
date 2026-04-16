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

    // 集团段风险指数变化图
    public function getRiskLog(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required',
        ], [
            'company_id.required' => '企业id不能为空',
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
        // 下属企业数量
        $count_num = count($company_ids);
        // 第七天
        $day_7 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-6 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_7_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-6 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[0] = ['title' => date('Ymd', strtotime('-6 days')),
            'inherent_risk_num' => $this->calculate($day_7, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_7, $count_num)[1],
            'float_risk_num' => $this->calculate($day_7_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_7_1, $count_num)[1]];

        // 第六天
        $day_6 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-5 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_6_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-5 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[1] = ['title' => date('Ymd', strtotime('-5 days')),
            'inherent_risk_num' => $this->calculate($day_6, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_6, $count_num)[1],
            'float_risk_num' => $this->calculate($day_6_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_6_1, $count_num)[1]];

        // 第七天
        $day_5 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-4 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_5_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-4 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[2] = ['title' => date('Ymd', strtotime('-4 days')),
            'inherent_risk_num' => $this->calculate($day_5, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_5, $count_num)[1],
            'float_risk_num' => $this->calculate($day_5_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_5_1, $count_num)[1]];

        // 第七天
        $day_4 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-3 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_4_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-3 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[3] = ['title' => date('Ymd', strtotime('-3 days')),
            'inherent_risk_num' => $this->calculate($day_4, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_4, $count_num)[1],
            'float_risk_num' => $this->calculate($day_4_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_4_1, $count_num)[1]];

        // 第七天
        $day_3 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-2 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_3_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-2 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[4] = ['title' => date('Ymd', strtotime('-2 days')),
            'inherent_risk_num' => $this->calculate($day_3, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_3, $count_num)[1],
            'float_risk_num' => $this->calculate($day_3_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_3_1, $count_num)[1]];

        // 第七天
        $day_2 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd', strtotime('-1 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_2_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd', strtotime('-1 days')))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[5] = ['title' => date('Ymd', strtotime('-1 days')),
            'inherent_risk_num' => $this->calculate($day_2, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_2, $count_num)[1],
            'float_risk_num' => $this->calculate($day_2_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_2_1, $count_num)[1]];

        // 第七天
        $day_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 1)->where('date', date('Ymd'))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();
        $day_1_1 = RiskLog::query()->whereIn('company_id', $company_ids)->where('type', 2)->where('date', date('Ymd'))->select('risk_grade', DB::raw('count(*) as num'), DB::raw('SUM(risk_num) as risk_num'))->groupBy('risk_grade')->get();

        $data[6] = ['title' => date('Ymd'),
            'inherent_risk_num' => $this->calculate($day_1, $count_num)[0],
            'inherent_risk_grade' => $this->calculate($day_1, $count_num)[1],
            'float_risk_num' => $this->calculate($day_1_1, $count_num)[0],
            'float_risk_grade' => $this->calculate($day_1_1, $count_num)[1]];

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
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $companies = Company::query()->where('id', $request->company_id)->with('companies', function ($query) {
            $query->where('status', 1);
        })->first();
        $company_ids = $this->ascTree($companies);

        $data = [];
        foreach ($company_ids as $k => $items) {
            $monthly_investigation = MonthlyInvestigation::query()->where('company_id', $items)->count();
            $monthly_investigation_old = MonthlyInvestigation::query()->where('company_id', $items)->where('updated_at', 'NOT LIKE', date('Y-m-d'))->count();
            $monthly_investigation_result = MonthlyInvestigation::query()->where('company_id', $items)->where('correct_result', '已整改')->count();
            $monthly_investigation_result_old = MonthlyInvestigation::query()->where('company_id', $items)->where('updated_at', 'NOT LIKE', date('Y-m-d'))->where('correct_result', '已整改')->count();
            $data[$k]['company_name'] = Company::query()->where('id', $items)->value('title');
            if ($monthly_investigation && $monthly_investigation_result) {
                $data[$k]['monthly_investigation_scale'] = round($monthly_investigation_result / $monthly_investigation, 2) * 100;
            } else {
                $data[$k]['monthly_investigation_scale'] = 0;
            }
            if ($monthly_investigation_old && $monthly_investigation_result_old) {
                $data[$k]['jqr'] = round($monthly_investigation_result / $monthly_investigation, 2) * 100 - round($monthly_investigation_result_old / $monthly_investigation_old, 2) * 100;
            } else {
                $data[$k]['jqr'] = 0;
            }

            $data[$k]['company_id'] = $items;
        }

        $monthly_investigation_scale = array_column($data, 'monthly_investigation_scale');
        array_multisort($monthly_investigation_scale, SORT_DESC, $data);

        return $this->success($data);
    }
}
