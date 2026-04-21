<?php

namespace App\Http\Controllers\Api;

use App\Models\AccidentBulletin;
use App\Models\AccidentBulletinKid;
use App\Models\Company;
use App\Models\EmergencyDrill;
use App\Models\FireEquipment;
use App\Models\FireFacility;
use App\Models\FundingExecution;
use App\Models\InternalMeeting;
use App\Models\InternalTraining;
use App\Models\MonthlyInvestigation;
use App\Models\MonthStatistic;
use App\Models\Personnel;
use App\Models\SpecialEquipment;
use App\Traits\ApiTree;
use http\Exception;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MonthStatisticsController extends Controller
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
        $data = MonthStatistic::query()->where('company_id', $request->company_id)
            ->with('monthStatisticAccident', 'monthStatisticControl')->orderByDesc('created_at')->paginate($request->per_page ?: 15);

        return $this->success($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return Response
     */
    public function store(Request $request, MonthStatistic $monthStatistic)
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
        $snap = MonthStatistic::query()->where('company_id', $request->company_id)
            ->whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))->count();
        if ($snap > 0) {
            return $this->failed('你已经提交过当月月报了，如填报错误请前往修改');
        }
        $monthStatistic->fill($request->only('average_employee',
            'safety_meeting_count',
            'fire_meeting_count',
            'safety_check_count',
            'fire_check_count',
            'safety_funding',
            'hydrating_seedlings',
            'retrofit_electrical',
            'fire_extinguisher',
            'smart_fire',
            'safety_training_count',
            'safety_training_number',
            'new_people_training_number',
            'fire_training_count',
            'fire_training_number',
            'safety_emergency_count',
            'safety_emergency_number',
            'fire_emergency_count',
            'fire_emergency_number',
            'some_hidden_danger',
            'some_rectify_hidden_danger',
            'no_rectify_info',
            'big_hidden_danger',
            'big_rectify_hidden_danger',
            'govern_hidden_danger_count',
            'fire_fighting_danger',
            'fire_fighting_hidden_danger',
            'fire_fighting_hidden_danger_rectify',
            'accident_bulletin_count',
            'company_id'));
        $monthStatistic->user_id = $request->user()->id;
        $monthStatistic->last_user_id = $request->user()->id;
        $data = DB::transaction(function () use ($request, $monthStatistic) {
            $monthStatistic->save();

            $govern_hidden_danger = $request->input('govern_hidden_danger');
            // 通知范围
            if ($govern_hidden_danger) {
                foreach ($govern_hidden_danger as $v) {
                    $govern_hidden_dangerKid = $monthStatistic->monthStatisticControl()->make([
                        'govern_title' => $v['govern_title'],
                        'govern_supplies' => $v['govern_supplies'],
                        'govern_user' => $v['govern_user'],
                        'govern_date' => $v['govern_date'],
                        'govern_text' => $v['govern_text'],
                        'govern_money' => $v['govern_money'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $govern_hidden_dangerKid->save();
                }
            }

            $accident_bulletin = $request->input('accident_bulletin');
            // 通知范围
            if ($accident_bulletin) {
                foreach ($accident_bulletin as $v) {
                    $meetingKid = $monthStatistic->monthStatisticAccident()->make([
                        'happen_time' => $v['happen_time'],
                        'department' => $v['department'],
                        'name' => $v['name'],
                        'sex' => $v['sex'],
                        'age' => $v['age'],
                        'work_type' => $v['work_type'],
                        'work_age' => $v['work_age'],
                        'education_level' => $v['education_level'],
                        'degree_injury' => $v['degree_injury'],
                        'type' => $v['type'],
                        'direct_cause' => $v['direct_cause'],
                        'content' => $v['content'],
                        'days_off' => $v['days_off'],
                        'direct_loss_property' => $v['direct_loss_property'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $meetingKid->save();
                }
            }

            return $monthStatistic;
        });

        return $this->success($monthStatistic);
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return Response
     */
    public function show($id)
    {
        $data = MonthStatistic::query()->with('monthStatisticAccident', 'monthStatisticControl')->find($id);

        return $this->success($data);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  SpecialEquipment  $specialEquipment
     * @return Response
     */
    public function update(Request $request, MonthStatistic $monthStatistic)
    {
        $monthStatistic->fill($request->only('average_employee',
            'safety_meeting_count',
            'fire_meeting_count',
            'safety_check_count',
            'fire_check_count',
            'safety_funding',
            'fire_funding',
            'hydrating_seedlings',
            'retrofit_electrical',
            'fire_extinguisher',
            'smart_fire',
            'safety_training_count',
            'safety_training_number',
            'new_people_training_number',
            'fire_training_count',
            'fire_training_number',
            'safety_emergency_count',
            'safety_emergency_number',
            'fire_emergency_count',
            'fire_emergency_number',
            'some_hidden_danger',
            'some_rectify_hidden_danger',
            'no_rectify_info',
            'big_hidden_danger',
            'big_rectify_hidden_danger',
            'govern_hidden_danger_count',
            'fire_fighting_danger',
            'fire_fighting_hidden_danger',
            'fire_fighting_hidden_danger_rectify',
            'accident_bulletin_count',
            'company_id'));
        $monthStatistic->last_user_id = $request->user()->id;
        $data = DB::transaction(function () use ($request, $monthStatistic) {
            $monthStatistic->save();

            $govern_hidden_danger = $request->input('govern_hidden_danger');
            // 通知范围
            if ($govern_hidden_danger) {
                $monthStatistic->monthStatisticControl()->delete();
                foreach ($govern_hidden_danger as $v) {
                    $govern_hidden_dangerKid = $monthStatistic->monthStatisticControl()->make([
                        'govern_title' => $v['govern_title'],
                        'govern_supplies' => $v['govern_supplies'],
                        'govern_user' => $v['govern_user'],
                        'govern_date' => $v['govern_date'],
                        'govern_text' => $v['govern_text'],
                        'govern_money' => $v['govern_money'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $govern_hidden_dangerKid->save();
                }
            }

            $accident_bulletin = $request->input('accident_bulletin');
            // 通知范围
            if ($accident_bulletin) {
                $monthStatistic->monthStatisticAccident()->delete();
                foreach ($accident_bulletin as $v) {
                    $meetingKid = $monthStatistic->monthStatisticAccident()->make([
                        'happen_time' => $v['happen_time'],
                        'department' => $v['department'],
                        'name' => $v['name'],
                        'sex' => $v['sex'],
                        'age' => $v['age'],
                        'work_type' => $v['work_type'],
                        'work_age' => $v['work_age'],
                        'education_level' => $v['education_level'],
                        'degree_injury' => $v['degree_injury'],
                        'type' => $v['type'],
                        'direct_cause' => $v['direct_cause'],
                        'content' => $v['content'],
                        'days_off' => $v['days_off'],
                        'direct_loss_property' => $v['direct_loss_property'],
                        'company_id' => $request->company_id,
                        'user_id' => $request->user()->id,
                        'last_user_id' => $request->user()->id,
                    ]);
                    $meetingKid->save();
                }
            }

            return $monthStatistic;
        });

        return $this->success($monthStatistic);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  SpecialEquipment  $specialEquipment
     * @return Response
     *
     * @throws \Exception
     */
    public function destroy(MonthStatistic $monthStatistic)
    {
        try {
            $monthStatistic->delete();
        } catch (Exception $e) {
            return $this->failed($e->getMessage() ?? '删除月报失败');
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
            request()->offsetSet('date_time', date('Y-m'));
            $count = $this->statistics($request);
        } else {
            $count = null;
        }
        $data = [];
        if ($company->is_produce == 1) {
            $personnel = Personnel::query()->where('company_id', $request->company_id)->first();
            if ($personnel && $personnel->total_people > 0) {
                $total_people = $personnel->total_people;
            } else {
                $total_people = 0;
            }
            // 公司级安全例会
            $safety_meeting = InternalMeeting::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->where('type', '安全例会')->count();
            // 公司级消防例会
            $fire_fighting_meeting = InternalMeeting::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->where('type', '消防例会')->count();
            // 安全检查次数
            $safety_investigation = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->where('type', '!=', '消防')->count();
            // 消防检查次数
            $fire_fighting_investigation = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->where('type', '消防')->count();
            // 当月安全投入费用
            $safety_funding = FundingExecution::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->whereHas('security_investment', function (Builder $query) {
                    $query->where('type', '安全投入');
                })->sum('budget');
            // 当月消防投入费用
            $fire_fighting_funding = FundingExecution::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->whereHas('security_investment', function (Builder $query) {
                    $query->where('type', '消防投入');
                })->sum('budget');
            // 消防增添器材数量（水带苗子、改造电气线路、灭火器、烟感报警、智慧消防系统）
            $fire_equipment = FireEquipment::query()
                ->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->groupBy('special_type')
                ->select(DB::raw('count(*) as count, special_type'))
                ->get();

            $snap = [];
            foreach ($fire_equipment as $value) {
                $snap[$value->special_type] = $value->count;
            }
            $hydrating_seedlings = array_key_exists('水带苗子', $snap) ? $snap['水带苗子'] : 0;
            $fire_extinguisher = array_key_exists('灭火器', $snap) ? $snap['灭火器'] : 0;
            $smart_fire = FireFacility::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))->where('special_type', '智慧消防系统')->count();
            $internal_training = InternalTraining::query()
                ->where('company_id', $request->company_id)
                ->whereYear('training_date', date('Y'))
                ->whereMonth('training_date', date('m'))
                ->select(DB::raw('count(*) as count,SUM(number) as number, training_type'))
                ->groupBy('training_type')->get()->toArray();

            // 安全培训次数
            $snap_sub = array_search('安全培训', array_column($internal_training, 'training_type'));
            if ($snap_sub === 0 || $snap_sub) {
                $safety_training_count = $internal_training[$snap_sub]['count'];
            } else {
                $safety_training_count = 0;
            }
            // 安全培训人数
            if ($snap_sub === 0 || $snap_sub) {
                $safety_training_number = $internal_training[$snap_sub]['number'];
            } else {
                $safety_training_number = 0;
            }
            // 新员工培训人数
            $snap_sub1 = array_search('新员工培训', array_column($internal_training, 'training_type'));
            if ($snap_sub1 === 0 || $snap_sub1) {
                $new_people_training_number = $internal_training[$snap_sub1]['number'];
            } else {
                $new_people_training_number = 0;
            }
            // 消防培训次数
            $snap_sub2 = array_search('消防培训', array_column($internal_training, 'training_type'));
            if ($snap_sub2 === 0 || $snap_sub2) {
                $fire_training_count = $internal_training[$snap_sub2]['count'];
            } else {
                $fire_training_count = 0;
            }
            // 消防培训人数
            if ($snap_sub2 === 0 || $snap_sub2) {
                $fire_training_number = $internal_training[$snap_sub2]['number'];
            } else {
                $fire_training_number = 0;
            }
            $emergency_drill = EmergencyDrill::query()
                ->where('company_id', $request->company_id)
                ->whereYear('drill_time', date('Y'))
                ->whereMonth('drill_time', date('m'))
                ->select(DB::raw('count(*) as count,SUM(drill_number) as number, drill_type'))
                ->groupBy('drill_type')->get()->toArray();

            // 应急救援演练次数
            $snap_sub3 = array_search('安全生产', array_column($emergency_drill, 'drill_type'));
            if ($snap_sub3 === 0 || $snap_sub3) {
                $safety_emergency_count = $emergency_drill[$snap_sub3]['count'];
            } else {
                $safety_emergency_count = 0;
            }
            // 演练人数
            if ($snap_sub3 === 0 || $snap_sub3) {
                $safety_emergency_number = $emergency_drill[$snap_sub3]['number'];
            } else {
                $safety_emergency_number = 0;
            }
            // 消防演练次数
            $snap_sub4 = array_search('消防安全', array_column($emergency_drill, 'drill_type'));
            if ($snap_sub4 === 0 || $snap_sub4) {
                $fire_emergency_count = $emergency_drill[$snap_sub4]['count'];
            } else {
                $fire_emergency_count = 0;
            }
            // 演练人数
            if ($snap_sub4 === 0 || $snap_sub4) {
                $fire_emergency_number = $emergency_drill[$snap_sub4]['number'];
            } else {
                $fire_emergency_number = 0;
            }
            // 一般隐患排查数量
            $some_hidden_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('level', '一般隐患')
                ->count();
            // 一般隐患整改数量
            $some_rectify_hidden_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('level', '一般隐患')
                ->where('correct_result', '!=', '未整改')
                ->count();
            // 重大隐患排查数量
            $big_hidden_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('level', '重大隐患')
                ->count();
            // 重大隐患整改数量
            $big_rectify_hidden_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('level', '重大隐患')
                ->where('correct_result', '!=', '未整改')
                ->count();

            // 列入治理计划的重大隐患数量
            $govern_hidden_danger_count = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('level', '重大隐患')
                ->where('is_govern', 1)
                ->count();
            // 消防隐患排查数量（电器、消防设施、高层建筑）
            $fire_fighting_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('type', '消防')
                ->count();
            // 消防执法部门检查隐患数量
            $fire_fighting_hidden_danger = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('is_fire_fighting', 1)
                ->count();
            // 消防执法部门检查隐患整改数量
            $fire_fighting_hidden_danger_rectify = MonthlyInvestigation::query()->where('company_id', $request->company_id)
                ->whereYear('inv_time', date('Y'))
                ->whereMonth('inv_time', date('m'))
                ->where('is_fire_fighting', 1)
                ->where('correct_result', '!=', '未整改')
                ->count();
            // 当月事故数量
            $accident_bulletin_count = AccidentBulletin::query()->where('company_id', $request->company_id)
                ->whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->count();
            if ($company->is_bloc == 1) {
                // 平均职工数量
                $data['average_employee'] = $total_people + $count['average_employee'];
                $data['safety_meeting_count'] = $safety_meeting + $count['safety_meeting_count'];
                $data['fire_meeting_count'] = $fire_fighting_meeting + $count['fire_meeting_count'];
                $data['safety_check_count'] = $safety_investigation + $count['safety_check_count'];
                $data['fire_check_count'] = $fire_fighting_investigation + $count['fire_check_count'];
                $data['safety_funding'] = $safety_funding + $count['safety_funding'];
                $data['fire_funding'] = $fire_fighting_funding + $count['fire_funding'];
                $data['hydrating_seedlings'] = $hydrating_seedlings + $count['hydrating_seedlings'];
                $data['fire_extinguisher'] = $fire_extinguisher + $count['fire_extinguisher'];
                $data['smart_fire'] = $smart_fire + $count['smart_fire'];
                $data['safety_training_count'] = $safety_training_count + $count['safety_training_count'];
                $data['safety_training_number'] = $safety_training_number + $count['safety_training_number'];
                $data['new_people_training_number'] = $new_people_training_number + $count['new_people_training_number'];
                $data['fire_training_count'] = $fire_training_count + $count['fire_training_count'];
                $data['fire_training_number'] = $fire_training_number + $count['fire_training_number'];
                $data['safety_emergency_count'] = $safety_emergency_count + $count['safety_emergency_count'];

                $data['safety_emergency_number'] = $safety_emergency_number + $count['safety_emergency_number'];
                $data['fire_emergency_count'] = $fire_emergency_count + $count['fire_emergency_count'];
                $data['fire_emergency_number'] = $fire_emergency_number + $count['fire_emergency_number'];
                $data['some_hidden_danger'] = $some_hidden_danger + empty($count['other']) ? 0 : $count['other'][0]['some_hidden_danger'];
                $data['some_rectify_hidden_danger'] = $some_rectify_hidden_danger + empty($count['other']) ? 0 : $count['other'][0]['some_rectify_hidden_danger'];
                $data['big_hidden_danger'] = $big_hidden_danger + empty($count['other']) ? 0 : $count['other'][0]['big_hidden_danger'];
                $data['big_rectify_hidden_danger'] = $big_rectify_hidden_danger + empty($count['other']) ? 0 : $count['other'][0]['big_rectify_hidden_danger'];
                $data['govern_hidden_danger_count'] = $govern_hidden_danger_count + $count['govern_hidden_danger_count'];
                $data['fire_fighting_danger'] = $fire_fighting_danger + $count['fire_fighting_danger'];
                $data['fire_fighting_hidden_danger'] = $fire_fighting_hidden_danger + $count['fire_fighting_hidden_danger'];
                $data['fire_fighting_hidden_danger_rectify'] = $fire_fighting_hidden_danger_rectify + $count['fire_fighting_hidden_danger_rectify'];
                $data['accident_bulletin_count'] = $accident_bulletin_count + $count['accident_bulletin_count'];
            } else {
                $data['average_employee'] = $total_people;
                $data['safety_meeting_count'] = $safety_meeting;
                $data['fire_meeting_count'] = $fire_fighting_meeting;
                $data['safety_check_count'] = $safety_investigation;
                $data['fire_check_count'] = $fire_fighting_investigation;
                $data['safety_funding'] = $safety_funding;
                $data['fire_funding'] = $fire_fighting_funding;
                $data['hydrating_seedlings'] = $hydrating_seedlings;
                $data['fire_extinguisher'] = $fire_extinguisher;
                $data['smart_fire'] = $smart_fire;
                $data['safety_training_count'] = $safety_training_count;
                $data['safety_training_number'] = $safety_training_number;
                $data['new_people_training_number'] = $new_people_training_number;
                $data['fire_training_count'] = $fire_training_count;
                $data['fire_training_number'] = $fire_training_number;
                $data['safety_emergency_count'] = $safety_emergency_count;

                $data['safety_emergency_number'] = $safety_emergency_number;
                $data['fire_emergency_count'] = $fire_emergency_count;
                $data['fire_emergency_number'] = $fire_emergency_number;
                $data['some_hidden_danger'] = $some_hidden_danger;
                $data['some_rectify_hidden_danger'] = $some_rectify_hidden_danger;
                $data['big_hidden_danger'] = $big_hidden_danger;
                $data['big_rectify_hidden_danger'] = $big_rectify_hidden_danger;
                $data['govern_hidden_danger_count'] = $govern_hidden_danger_count;
                $data['fire_fighting_danger'] = $fire_fighting_danger;
                $data['fire_fighting_hidden_danger'] = $fire_fighting_hidden_danger;
                $data['fire_fighting_hidden_danger_rectify'] = $fire_fighting_hidden_danger_rectify;
                $data['accident_bulletin_count'] = $accident_bulletin_count;
            }
        } else {
            $data['average_employee'] = $count['average_employee'];
            $data['safety_meeting_count'] = $count['safety_meeting_count'];
            $data['fire_meeting_count'] = $count['fire_meeting_count'];
            $data['safety_check_count'] = $count['safety_check_count'];
            $data['fire_check_count'] = $count['fire_check_count'];
            $data['safety_funding'] = $count['safety_funding'];
            $data['fire_funding'] = $count['fire_funding'];
            $data['hydrating_seedlings'] = $count['hydrating_seedlings'];
            $data['fire_extinguisher'] = $count['fire_extinguisher'];
            $data['smart_fire'] = $count['smart_fire'];
            $data['safety_training_count'] = $count['safety_training_count'];
            $data['safety_training_number'] = $count['safety_training_number'];
            $data['new_people_training_number'] = $count['new_people_training_number'];
            $data['fire_training_count'] = $count['fire_training_count'];
            $data['fire_training_number'] = $count['fire_training_number'];
            $data['safety_emergency_count'] = $count['safety_emergency_count'];

            $data['safety_emergency_number'] = $count['safety_emergency_number'];
            $data['fire_emergency_count'] = $count['fire_emergency_count'];
            $data['fire_emergency_number'] = $count['fire_emergency_number'];
            $data['some_hidden_danger'] = empty($count['other']) ? 0 : $count['other'][0]['some_hidden_danger'];
            $data['some_rectify_hidden_danger'] = empty($count['other']) ? 0 : $count['other'][0]['some_rectify_hidden_danger'];
            $data['big_hidden_danger'] = empty($count['other']) ? 0 : $count['other'][0]['big_hidden_danger'];
            $data['big_rectify_hidden_danger'] = empty($count['other']) ? 0 : $count['other'][0]['big_rectify_hidden_danger'];
            $data['govern_hidden_danger_count'] = $count['govern_hidden_danger_count'];
            $data['fire_fighting_danger'] = $count['fire_fighting_danger'];
            $data['fire_fighting_hidden_danger'] = $count['fire_fighting_hidden_danger'];
            $data['fire_fighting_hidden_danger_rectify'] = $count['fire_fighting_hidden_danger_rectify'];
            $data['accident_bulletin_count'] = $count['accident_bulletin_count'];
        }

        $company_ids = Company::query()->where('pid', $request->company_id)->pluck('id');
        // 列入重大隐患隐患详情
        $govern_hidden_danger = MonthlyInvestigation::query()->whereIn('company_id', $company_ids)
            ->whereYear('inv_time', date('Y'))
            ->whereMonth('inv_time', date('m'))
            ->where('level', '重大隐患')
            ->where('is_govern', 1)
            ->get();
        $data['govern_hidden_danger'] = $govern_hidden_danger;
        // 事故详情
        $accident_bulletin = AccidentBulletinKid::query()->whereIn('company_id', $company_ids)
            ->whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->with('accident_bulletin')
            ->get();
        $data['accident_bulletin'] = $accident_bulletin;

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
        $year = substr($request->date_time, 0, 4);
        $month = substr($request->date_time, 5, 2);
        // 按照年月份筛选接口
        $data = MonthStatistic::query()->whereIn('company_id', $company_ids)->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->select(DB::raw('SUM(average_employee) as average_employee,
            SUM(safety_meeting_count) as safety_meeting_count,
            SUM(fire_meeting_count) as fire_meeting_count,
            SUM(safety_check_count) as safety_check_count,
            SUM(fire_check_count) as fire_check_count,
            SUM(safety_funding) as safety_funding,
            SUM(fire_funding) as fire_funding,
            SUM(hydrating_seedlings) as hydrating_seedlings,
            SUM(retrofit_electrical) as retrofit_electrical,
            SUM(fire_extinguisher) as fire_extinguisher,
            SUM(smart_fire) as smart_fire,
            SUM(safety_training_count) as safety_training_count,
            SUM(safety_training_number) as safety_training_number,
            SUM(new_people_training_number) as new_people_training_number,
            SUM(fire_training_count) as fire_training_count,
            SUM(fire_training_number) as fire_training_number,
            SUM(safety_emergency_count) as safety_emergency_count,
            SUM(safety_emergency_number) as safety_emergency_number,
            SUM(fire_emergency_count) as fire_emergency_count,
            SUM(fire_emergency_number) as fire_emergency_number,
            SUM(govern_hidden_danger_count) as govern_hidden_danger_count,
            SUM(fire_fighting_danger) as fire_fighting_danger,
            SUM(fire_fighting_hidden_danger) as fire_fighting_hidden_danger,
            SUM(fire_fighting_hidden_danger_rectify) as fire_fighting_hidden_danger_rectify,
            SUM(accident_bulletin_count) as accident_bulletin_count,
            count(*) as count_number'))
            ->first();

        $data['other'] = MonthStatistic::query()->whereIn('company_id', $company_ids)->whereYear('month_statistics.created_at', $year)
            ->whereMonth('month_statistics.created_at', $month)->select(DB::raw('SUM(month_statistics.some_hidden_danger) as some_hidden_danger,
            SUM(month_statistics.some_rectify_hidden_danger) as some_rectify_hidden_danger,
            SUM(month_statistics.big_hidden_danger) as big_hidden_danger,
            SUM(month_statistics.big_rectify_hidden_danger) as big_rectify_hidden_danger,companies.enterprise_type_id'))
            ->leftJoin('companies', 'month_statistics.company_id', '=', 'companies.id')
            ->groupBy('companies.enterprise_type_id')->get();
        $data['date'] = $year.'-'.$month;

        return $data;
    }

    public function getHappening(Request $request)
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
        $year = substr($request->date_time, 0, 4);
        $month = substr($request->date_time, 5, 2);
        $ids = MonthStatistic::query()->whereIn('company_id', $company_ids)->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)->pluck('company_id')->toArray();
        if ($request->type == 'isReport') {
            $data = Company::query()->whereIn('id', $ids)->get();
            $data->map(function ($model) {
                $model->now_status = '已上报';
            });
        } elseif ($request->type == 'isNotReport') {
            $data = Company::query()->whereIn('id', $company_ids)->whereNotIn('id', $ids)->get();
            $data->map(function ($model) {
                $model->now_status = '未上报';
            });
        } else {
            $data = Company::query()->whereIn('id', $company_ids)->get();
            $data->map(function ($model) use ($ids) {
                if (in_array($model->id, $ids)) {
                    $model->now_status = '已上报';
                } else {
                    $model->now_status = '未上报';
                }
            });
        }

        return $this->success($data);
    }
}
