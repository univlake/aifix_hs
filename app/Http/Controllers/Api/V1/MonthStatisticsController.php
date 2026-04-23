<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\CorrectionResult;
use App\Enums\HiddenDangerLevel;
use App\Enums\MeetingType;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreMonthStatisticsRequest;
use App\Http\Requests\Api\V1\UpdateMonthStatisticsRequest;
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
use App\Models\MonthStatisticAccident;
use App\Models\MonthStatisticControl;
use App\Models\Personnel;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MonthStatisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'nullable|integer',
            'pid' => 'nullable|integer',
        ]);

        if (! $request->filled('company_id') && ! $request->filled('pid')) {
            return $this->failed('company_id 或 pid 至少提供一个', 422);
        }

        $query = MonthStatistic::query();

        if ($request->filled('pid')) {
            // List reports from direct subordinates of the given company.
            // include_pid=1 additionally includes the parent itself (bloc reporting view).
            $subordinateIds = Company::query()
                ->where('pid', (int) $request->pid)
                ->pluck('id')
                ->all();
            if ($request->boolean('include_pid')) {
                $subordinateIds[] = (int) $request->pid;
            }
            $query->whereIn('company_id', $subordinateIds);
        } else {
            $query->where('company_id', $request->company_id);
        }

        $data = $query
            ->with(['monthStatisticAccident', 'monthStatisticControl', 'company:id,title'])
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = MonthStatistic::query()
            ->with(['monthStatisticAccident', 'monthStatisticControl'])
            ->find($id);

        if (! $data) {
            return $this->notFound('月报不存在');
        }

        return $this->success($data);
    }

    public function store(StoreMonthStatisticsRequest $request): JsonResponse
    {
        // Check duplicate for current month
        $exists = MonthStatistic::query()
            ->where('company_id', $request->company_id)
            ->whereYear('created_at', date('Y'))
            ->whereMonth('created_at', date('m'))
            ->exists();

        if ($exists) {
            return $this->failed('你已经提交过当月月报了，如填报错误请前往修改');
        }

        $data = DB::transaction(function () use ($request) {
            $monthStatistic = MonthStatistic::create($request->only(
                'average_employee', 'safety_meeting_count', 'fire_meeting_count',
                'safety_check_count', 'fire_check_count', 'safety_funding', 'fire_funding',
                'hydrating_seedlings', 'retrofit_electrical', 'fire_extinguisher', 'smart_fire',
                'safety_training_count', 'safety_training_number', 'new_people_training_number',
                'fire_training_count', 'fire_training_number',
                'safety_emergency_count', 'safety_emergency_number',
                'fire_emergency_count', 'fire_emergency_number',
                'some_hidden_danger', 'some_rectify_hidden_danger', 'no_rectify_info',
                'big_hidden_danger', 'big_rectify_hidden_danger', 'govern_hidden_danger_count',
                'fire_fighting_danger', 'fire_fighting_hidden_danger', 'fire_fighting_hidden_danger_rectify',
                'accident_bulletin_count', 'company_id'
            ));
            $monthStatistic->user_id = auth()->id() ?? 0;
            $monthStatistic->last_user_id = auth()->id() ?? 0;
            $monthStatistic->save();

            $this->bulkInsertGovernChildren(
                $monthStatistic->id,
                (int) $request->company_id,
                $request->input('govern_hidden_danger', []),
            );

            $this->bulkInsertAccidentChildren(
                $monthStatistic->id,
                (int) $request->company_id,
                $request->input('accident_bulletin', []),
            );

            return $monthStatistic->load(['monthStatisticAccident', 'monthStatisticControl']);
        });

        return $this->success($data);
    }

    public function update(UpdateMonthStatisticsRequest $request, int $id): JsonResponse
    {
        $monthStatistic = MonthStatistic::find($id);

        if (! $monthStatistic) {
            return $this->notFound('月报不存在');
        }

        $data = DB::transaction(function () use ($request, $monthStatistic) {
            $monthStatistic->update($request->only(
                'average_employee', 'safety_meeting_count', 'fire_meeting_count',
                'safety_check_count', 'fire_check_count', 'safety_funding', 'fire_funding',
                'hydrating_seedlings', 'retrofit_electrical', 'fire_extinguisher', 'smart_fire',
                'safety_training_count', 'safety_training_number', 'new_people_training_number',
                'fire_training_count', 'fire_training_number',
                'safety_emergency_count', 'safety_emergency_number',
                'fire_emergency_count', 'fire_emergency_number',
                'some_hidden_danger', 'some_rectify_hidden_danger', 'no_rectify_info',
                'big_hidden_danger', 'big_rectify_hidden_danger', 'govern_hidden_danger_count',
                'fire_fighting_danger', 'fire_fighting_hidden_danger', 'fire_fighting_hidden_danger_rectify',
                'accident_bulletin_count', 'company_id'
            ));
            $monthStatistic->last_user_id = auth()->id() ?? 0;
            $monthStatistic->save();

            $companyId = (int) ($request->company_id ?? $monthStatistic->company_id);

            $governItems = $request->input('govern_hidden_danger');
            if ($governItems !== null) {
                $monthStatistic->monthStatisticControl()->delete();
                $this->bulkInsertGovernChildren($monthStatistic->id, $companyId, $governItems);
            }

            $accidentItems = $request->input('accident_bulletin');
            if ($accidentItems !== null) {
                $monthStatistic->monthStatisticAccident()->delete();
                $this->bulkInsertAccidentChildren($monthStatistic->id, $companyId, $accidentItems);
            }

            return $monthStatistic->fresh(['monthStatisticAccident', 'monthStatisticControl']);
        });

        return $this->success($data);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = MonthStatistic::find($id);

        if (! $record) {
            return $this->notFound('月报不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    /**
     * Bulk-insert govern-plan children. Bypasses Eloquent events (no per-row activity log
     * for child snapshots — the parent MonthStatistic already records the activity), saving
     * N round-trips when a report has many entries.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function bulkInsertGovernChildren(int $monthStatisticId, int $companyId, array $items): void
    {
        if (empty($items)) {
            return;
        }

        $now = now();
        $userId = auth()->id() ?? 0;
        $rows = [];

        foreach ($items as $v) {
            $rows[] = [
                'govern_title' => $v['govern_title'] ?? null,
                'govern_supplies' => $v['govern_supplies'] ?? null,
                'govern_user' => $v['govern_user'] ?? null,
                'govern_date' => $v['govern_date'] ?? null,
                'govern_text' => $v['govern_text'] ?? null,
                'govern_money' => $v['govern_money'] ?? null,
                'month_statistic_id' => $monthStatisticId,
                'company_id' => $companyId,
                'user_id' => $userId,
                'last_user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        MonthStatisticControl::insert($rows);
    }

    /**
     * Bulk-insert accident-bulletin children. See bulkInsertGovernChildren() for rationale.
     *
     * @param  array<int, array<string, mixed>>  $items
     */
    protected function bulkInsertAccidentChildren(int $monthStatisticId, int $companyId, array $items): void
    {
        if (empty($items)) {
            return;
        }

        $now = now();
        $userId = auth()->id() ?? 0;
        $rows = [];

        foreach ($items as $v) {
            $rows[] = [
                'happen_time' => $v['happen_time'] ?? null,
                'department' => $v['department'] ?? null,
                'name' => $v['name'] ?? null,
                'sex' => $v['sex'] ?? null,
                'age' => $v['age'] ?? null,
                'work_type' => $v['work_type'] ?? null,
                'work_age' => $v['work_age'] ?? null,
                'education_level' => $v['education_level'] ?? null,
                'degree_injury' => $v['degree_injury'] ?? null,
                'type' => $v['type'] ?? null,
                'direct_cause' => $v['direct_cause'] ?? null,
                'content' => $v['content'] ?? null,
                'days_off' => $v['days_off'] ?? null,
                'direct_loss_property' => $v['direct_loss_property'] ?? null,
                'month_statistic_id' => $monthStatisticId,
                'company_id' => $companyId,
                'user_id' => $userId,
                'last_user_id' => $userId,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        MonthStatisticAccident::insert($rows);
    }

    /**
     * 生成当月月报的预填充数据。
     *
     * 数据来源：
     *   - is_produce=1：聚合本企业当月生产数据
     *   - is_bloc=1：同时累加直接下级企业的数据
     *   - 治理计划/事故详情：汇总本企业 + 直接下级企业
     */
    public function stuff(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
        ]);

        $company = Company::query()->with('baseArea', 'enterpriseType')->find($request->company_id);
        if (! $company) {
            return $this->notFound('企业不存在');
        }

        $year = (int) date('Y');
        $month = (int) date('m');

        $self = $company->is_produce ? $this->aggregateMonth([(int) $company->id], $year, $month) : $this->emptyMonthCounts();

        $subIds = [];
        if ($company->is_bloc) {
            $subIds = Company::query()->where('pid', $company->id)->pluck('id')->map(fn ($id) => (int) $id)->all();
        }
        $subs = $this->aggregateMonth($subIds, $year, $month);

        $counts = [];
        foreach ($this->monthCountKeys() as $key) {
            $counts[$key] = (int) ($self[$key] ?? 0) + (int) ($subs[$key] ?? 0);
        }

        // 起始职工数量：本企业 Personnel.total_people（若生产端）
        if ($company->is_produce) {
            $personnel = Personnel::query()->where('company_id', $company->id)->first();
            $counts['average_employee'] = (int) ($personnel->total_people ?? 0) + (int) ($subs['average_employee'] ?? 0);
        }

        // 治理计划详情与事故详情：本企业 + 直接下级
        $detailIds = array_values(array_unique(array_merge([(int) $company->id], $subIds)));

        $governDetails = MonthlyInvestigation::query()
            ->whereIn('company_id', $detailIds)
            ->whereYear('inv_time', $year)
            ->whereMonth('inv_time', $month)
            ->where('level', HiddenDangerLevel::Major->value)
            ->where('is_govern', 1)
            ->get();

        $accidentDetails = AccidentBulletinKid::query()
            ->whereIn('company_id', $detailIds)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->get();

        $counts['no_rectify_info'] = null;
        $counts['govern_hidden_danger'] = $governDetails;
        $counts['accident_bulletin'] = $accidentDetails;
        $counts['company_id'] = (int) $company->id;
        $counts['company_name'] = (string) $company->title;

        return $this->success($counts);
    }

    /**
     * Aggregate month counts for the given set of company ids.
     *
     * @param  array<int>  $companyIds
     * @return array<string, int>
     */
    protected function aggregateMonth(array $companyIds, int $year, int $month): array
    {
        if (empty($companyIds)) {
            return $this->emptyMonthCounts();
        }

        // Personnel baseline: sum of total_people across the given companies.
        $averageEmployee = (int) (Personnel::query()
            ->whereIn('company_id', $companyIds)
            ->sum('total_people'));

        $safetyMeetingType = MeetingType::Safety->value;
        $fireMeetingType = MeetingType::Fire->value;

        // Collapse 2 InternalMeeting type-counts into one CASE-WHEN aggregate.
        $meetingRow = InternalMeeting::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type = '{$safetyMeetingType}' THEN 1 ELSE 0 END), 0) AS safety_meeting,
                COALESCE(SUM(CASE WHEN type = '{$fireMeetingType}' THEN 1 ELSE 0 END), 0) AS fire_meeting
            ")->first();
        $safetyMeeting = (int) ($meetingRow->safety_meeting ?? 0);
        $fireMeeting = (int) ($meetingRow->fire_meeting ?? 0);

        // Collapse 2 MonthlyInvestigation type-counts (on created_at) into one CASE-WHEN aggregate.
        $checkRow = MonthlyInvestigation::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN type != '消防' THEN 1 ELSE 0 END), 0) AS safety_check,
                COALESCE(SUM(CASE WHEN type = '消防' THEN 1 ELSE 0 END), 0) AS fire_check
            ")->first();
        $safetyCheck = (int) ($checkRow->safety_check ?? 0);
        $fireCheck = (int) ($checkRow->fire_check ?? 0);

        $safetyFunding = (int) FundingExecution::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->whereHas('security_investment', function ($q) {
                $q->where('type', '安全投入');
            })->sum('budget');
        $fireFunding = (int) FundingExecution::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->whereHas('security_investment', function ($q) {
                $q->where('type', '消防投入');
            })->sum('budget');

        $fireEquip = FireEquipment::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->select(DB::raw('special_type, count(*) as cnt'))
            ->groupBy('special_type')
            ->pluck('cnt', 'special_type');

        $hydrating = (int) ($fireEquip['水带苗子'] ?? 0);
        $retrofit = (int) ($fireEquip['改造电气线路'] ?? 0);
        $extinguisher = (int) ($fireEquip['灭火器'] ?? 0);
        $smartFire = (int) FireFacility::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)
            ->where('special_type', '智慧消防系统')->count();

        $trainings = InternalTraining::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('training_date', $year)->whereMonth('training_date', $month)
            ->select(DB::raw('training_type, count(*) as cnt, COALESCE(SUM(number),0) as num'))
            ->groupBy('training_type')->get()->keyBy('training_type');

        $safetyTrainCount = (int) ($trainings['安全培训']->cnt ?? 0);
        $safetyTrainNum = (int) ($trainings['安全培训']->num ?? 0);
        $newPeopleNum = (int) ($trainings['新员工培训']->num ?? 0);
        $fireTrainCount = (int) ($trainings['消防培训']->cnt ?? 0);
        $fireTrainNum = (int) ($trainings['消防培训']->num ?? 0);

        $drills = EmergencyDrill::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('drill_time', $year)->whereMonth('drill_time', $month)
            ->select(DB::raw('drill_type, count(*) as cnt, COALESCE(SUM(drill_number),0) as num'))
            ->groupBy('drill_type')->get()->keyBy('drill_type');

        $safetyEmCount = (int) ($drills['安全生产']->cnt ?? 0);
        $safetyEmNum = (int) ($drills['安全生产']->num ?? 0);
        $fireEmCount = (int) ($drills['消防安全']->cnt ?? 0);
        $fireEmNum = (int) ($drills['消防安全']->num ?? 0);

        $generalLevel = HiddenDangerLevel::General->value;
        $majorLevel = HiddenDangerLevel::Major->value;
        $unrectified = CorrectionResult::Unrectified->value;

        // Collapse 8 MonthlyInvestigation conditional counts (on inv_time) into one CASE-WHEN aggregate.
        $invRow = MonthlyInvestigation::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('inv_time', $year)->whereMonth('inv_time', $month)
            ->selectRaw("
                COALESCE(SUM(CASE WHEN level = '{$generalLevel}' THEN 1 ELSE 0 END), 0) AS some_hidden,
                COALESCE(SUM(CASE WHEN level = '{$generalLevel}' AND correct_result != '{$unrectified}' THEN 1 ELSE 0 END), 0) AS some_rectify,
                COALESCE(SUM(CASE WHEN level = '{$majorLevel}' THEN 1 ELSE 0 END), 0) AS big_hidden,
                COALESCE(SUM(CASE WHEN level = '{$majorLevel}' AND correct_result != '{$unrectified}' THEN 1 ELSE 0 END), 0) AS big_rectify,
                COALESCE(SUM(CASE WHEN level = '{$majorLevel}' AND is_govern = 1 THEN 1 ELSE 0 END), 0) AS govern_count,
                COALESCE(SUM(CASE WHEN type = '消防' THEN 1 ELSE 0 END), 0) AS fire_danger,
                COALESCE(SUM(CASE WHEN is_fire_fighting = 1 THEN 1 ELSE 0 END), 0) AS fire_law,
                COALESCE(SUM(CASE WHEN is_fire_fighting = 1 AND correct_result != '{$unrectified}' THEN 1 ELSE 0 END), 0) AS fire_law_rectify
            ")->first();
        $someHidden = (int) ($invRow->some_hidden ?? 0);
        $someRectify = (int) ($invRow->some_rectify ?? 0);
        $bigHidden = (int) ($invRow->big_hidden ?? 0);
        $bigRectify = (int) ($invRow->big_rectify ?? 0);
        $governCount = (int) ($invRow->govern_count ?? 0);
        $fireDanger = (int) ($invRow->fire_danger ?? 0);
        $fireLaw = (int) ($invRow->fire_law ?? 0);
        $fireLawRectify = (int) ($invRow->fire_law_rectify ?? 0);

        $accidentCount = AccidentBulletin::query()
            ->whereIn('company_id', $companyIds)
            ->whereYear('created_at', $year)->whereMonth('created_at', $month)->count();

        return [
            'average_employee' => $averageEmployee,
            'safety_meeting_count' => $safetyMeeting,
            'fire_meeting_count' => $fireMeeting,
            'safety_check_count' => $safetyCheck,
            'fire_check_count' => $fireCheck,
            'safety_funding' => $safetyFunding,
            'fire_funding' => $fireFunding,
            'hydrating_seedlings' => $hydrating,
            'retrofit_electrical' => $retrofit,
            'fire_extinguisher' => $extinguisher,
            'smart_fire' => $smartFire,
            'safety_training_count' => $safetyTrainCount,
            'safety_training_number' => $safetyTrainNum,
            'new_people_training_number' => $newPeopleNum,
            'fire_training_count' => $fireTrainCount,
            'fire_training_number' => $fireTrainNum,
            'safety_emergency_count' => $safetyEmCount,
            'safety_emergency_number' => $safetyEmNum,
            'fire_emergency_count' => $fireEmCount,
            'fire_emergency_number' => $fireEmNum,
            'some_hidden_danger' => $someHidden,
            'some_rectify_hidden_danger' => $someRectify,
            'big_hidden_danger' => $bigHidden,
            'big_rectify_hidden_danger' => $bigRectify,
            'govern_hidden_danger_count' => $governCount,
            'fire_fighting_danger' => $fireDanger,
            'fire_fighting_hidden_danger' => $fireLaw,
            'fire_fighting_hidden_danger_rectify' => $fireLawRectify,
            'accident_bulletin_count' => $accidentCount,
        ];
    }

    /**
     * @return array<string, int>
     */
    protected function emptyMonthCounts(): array
    {
        return array_fill_keys($this->monthCountKeys(), 0);
    }

    /**
     * @return array<string>
     */
    protected function monthCountKeys(): array
    {
        return [
            'average_employee', 'safety_meeting_count', 'fire_meeting_count',
            'safety_check_count', 'fire_check_count', 'safety_funding', 'fire_funding',
            'hydrating_seedlings', 'retrofit_electrical', 'fire_extinguisher', 'smart_fire',
            'safety_training_count', 'safety_training_number', 'new_people_training_number',
            'fire_training_count', 'fire_training_number',
            'safety_emergency_count', 'safety_emergency_number',
            'fire_emergency_count', 'fire_emergency_number',
            'some_hidden_danger', 'some_rectify_hidden_danger',
            'big_hidden_danger', 'big_rectify_hidden_danger', 'govern_hidden_danger_count',
            'fire_fighting_danger', 'fire_fighting_hidden_danger', 'fire_fighting_hidden_danger_rectify',
            'accident_bulletin_count',
        ];
    }

    /**
     * 月报汇总：对给定父企业的直接下级，在给定年月份范围内对所有数值字段求和。
     */
    public function statistics(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'date_time' => 'required|date_format:Y-m',
        ]);

        $companyId = (int) $request->company_id;
        [$year, $month] = array_map('intval', explode('-', $request->date_time));

        $subordinateIds = Company::query()->where('pid', $companyId)->pluck('id')->all();

        $base = MonthStatistic::query()
            ->whereIn('company_id', $subordinateIds)
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month);

        $selectExpr = collect($this->monthCountKeys())
            ->map(fn (string $key) => "COALESCE(SUM({$key}),0) AS {$key}")
            ->push('COUNT(*) AS count_number')
            ->implode(', ');

        $totals = (clone $base)
            ->selectRaw($selectExpr)
            ->first();

        $normalized = [];
        foreach ($this->monthCountKeys() as $key) {
            $normalized[$key] = (int) ($totals->{$key} ?? 0);
        }
        $normalized['count_number'] = (int) ($totals->count_number ?? 0);
        $normalized['date'] = sprintf('%04d-%02d', $year, $month);
        $normalized['subordinate_count'] = count($subordinateIds);

        return $this->success($normalized);
    }
}
