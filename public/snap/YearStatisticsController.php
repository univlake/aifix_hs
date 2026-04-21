<?php

namespace App\Http\Controllers\Api;

use App\Models\CertificateStatus;
use App\Models\Company;
use App\Models\ProductionStandardization;
use App\Models\SecurityInvestment;
use App\Models\SpecialEquipment;
use App\Models\YearStatistic;
use App\Models\YearStatisticKid;
use App\Traits\ApiTree;
use http\Exception;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class YearStatisticsController extends Controller
{
    use ApiTree;

    /**
     * Display a listing of the resource.
     *
     * @return Response
     */
    public function index(Request $request)
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
        $data = YearStatistic::query()->where('company_id', $request->company_id)
            ->with('yearStatisticKid')->paginate($request->per_page ?: 15);

        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request, YearStatistic $yearStatistic)
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
        $snap = YearStatistic::query()->where('company_id', $request->company_id)
            ->whereYear('created_at', date('Y'))->count();
        if ($snap > 0) {
            return $this->failed('你已经提交过当年年报了，如填报错误请前往修改');
        }
        $yearStatistic->fill($request->only('company_name',
            'base_area',
            'enterprise_type',
            'safety_funding',
            'fire_fighting',
            'compliance_time',
            'revaluation_time',
            'company_id'));
        $yearStatistic->user_id = $request->user()->id;
        $yearStatistic->last_user_id = $request->user()->id;
        $data = DB::transaction(function () use ($request, $yearStatistic) {
            $yearStatistic->save();

            $kids = $request->input('kids');
            // 通知范围
            if ($kids) {
                foreach ($kids as $v) {
                    $kids = $yearStatistic->yearStatisticKid()->make([
                        'name' => $v['name'],
                        'type' => $v['type'],
                        'should_obtain_people' => $v['should_obtain_people'],
                        'already_obtain_people' => $v['already_obtain_people'],
                        'no_obtain_people' => $v['no_obtain_people'],
                        'train_people' => $v['train_people'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $kids->save();
                }
            }

            return $yearStatistic;
        });

        return $this->success($yearStatistic);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $data = YearStatistic::query()->with('yearStatisticKid')->find($id);

        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  SpecialEquipment  $specialEquipment
     * @return Response
     */
    public function update(Request $request, YearStatistic $yearStatistic)
    {
        $yearStatistic->fill($request->only('company_name',
            'base_area',
            'enterprise_type',
            'safety_funding',
            'fire_fighting',
            'compliance_time',
            'revaluation_time',
            'company_id'));
        $yearStatistic->last_user_id = $request->user()->id;
        $data = DB::transaction(function () use ($request, $yearStatistic) {
            $yearStatistic->save();

            $kids = $request->input('kids');
            // 通知范围
            if ($kids) {
                $yearStatistic->yearStatisticKid()->delete();
                foreach ($kids as $v) {
                    $kids = $yearStatistic->yearStatisticKid()->make([
                        'name' => $v['name'],
                        'type' => $v['type'],
                        'should_obtain_people' => $v['should_obtain_people'],
                        'already_obtain_people' => $v['already_obtain_people'],
                        'no_obtain_people' => $v['no_obtain_people'],
                        'train_people' => $v['train_people'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $kids->save();
                }
            }

            return $yearStatistic;
        });

        return $this->success($yearStatistic);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  SpecialEquipment  $specialEquipment
     * @return Response
     *
     * @throws \Exception
     */
    public function destroy(YearStatistic $yearStatistic)
    {
        try {
            $yearStatistic->delete();
        } catch (Exception $e) {
            return $this->failed($e->getMessage() ?? '删除年报失败');
        }

        return $this->message('删除成功', 204);
    }

    /**
     * 填充数据
     *
     * @return int|mixed
     */
    public function stuff(Request $request)
    {
        // 判定用户
        $company = Company::query()->with('baseArea', 'enterpriseType')->find($request->company_id);
        if ($company->is_bloc == 1) {
            request()->offsetSet('date_time', date('Y'));
            $count = $this->statistics($request);
        } else {
            $count = null;
        }
        $data['company_name'] = $company->title;
        $data['base_area'] = $company->baseArea['allname'].'/'.$company->address;
        $data['enterprise_type'] = $company->enterpriseType->title;

        $snap = ProductionStandardization::query()->where('company_id', $request->company_id)->first();
        if ($snap) {
            $data['compliance_time'] = $snap['get_time'];
            $data['revaluation_time'] = $snap['valid_period'];
        } else {
            $data['compliance_time'] = null;
            $data['revaluation_time'] = null;
        }

        // 按照身份判定
        if ($company->is_produce == 1) {
            $safety_funding = SecurityInvestment::query()->where('year', date('Y'))->where('type', '安全投入')->where('company_id', $request->company_id)->value('budget');
            $fire_fighting = SecurityInvestment::query()->where('year', date('Y'))->where('type', '消防投入')->where('company_id', $request->company_id)->value('budget');
            if ($company->is_bloc == 1) {
                $data['safety_funding'] = $safety_funding + $count['safety_funding'];
                $data['fire_fighting'] = $fire_fighting + $count['fire_fighting'];
            } else {
                $data['safety_funding'] = $safety_funding;
                $data['fire_fighting'] = $safety_funding;
            }
        } else {
            $data['safety_funding'] = $count['safety_funding'];
            $data['fire_fighting'] = $count['fire_fighting'];
        }

        // 三类人员达标情况
        $sl_data = CertificateStatus::query()->where('type', 1)->where('company_id', $request->company_id)->get();
        $data['sl_data'] = $sl_data;
        $xf_data = CertificateStatus::query()->where('type', 2)->where('company_id', $request->company_id)->get();
        $data['xf_data'] = $xf_data;

        return $this->success($data);

    }

    /**
     * 集团统计接口
     */
    public function statistics(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'company_id' => 'required',
            'date_time' => 'required',
        ], [
            'company_id.required' => '企业id不能为空',
            'date_time.required' => '时间不能为空',
        ]
        );
        if ($validator->fails()) {
            return $this->failed($validator->errors()->first());
        }
        // 首先获取下属企业符合条件（审核通过+生产端）的id
        $company_ids = Company::query()->where('pid', $request->company_id)->pluck('id');
        $year = $request->date_time;
        // 按照年月份筛选接口
        $data = YearStatistic::query()->whereIn('company_id', $company_ids)->whereYear('created_at', $year)
            ->select(DB::raw('SUM(safety_funding) as safety_funding,
            SUM(fire_fighting) as fire_fighting,
            count(*) as count_number'))
            ->first();

        $data['sl_data'] = YearStatisticKid::query()->whereIn('company_id', $company_ids)->whereYear('created_at', $year)
            ->where('type', 1)
            ->select(DB::raw('SUM(should_obtain_people) as should_obtain_people,
            SUM(already_obtain_people) as already_obtain_people,
            SUM(train_people) as train_people,
            name'))->groupBy('name')->get();
        $data['xf_data'] = YearStatisticKid::query()->whereIn('company_id', $company_ids)->whereYear('created_at', $year)
            ->where('type', 2)
            ->select(DB::raw('SUM(should_obtain_people) as should_obtain_people,
            SUM(already_obtain_people) as already_obtain_people,
            SUM(train_people) as train_people,
            name'))->groupBy('name')->get();
        $data['date'] = $year;

        return $data;
    }
}
