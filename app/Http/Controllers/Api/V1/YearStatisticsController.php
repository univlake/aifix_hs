<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\SecurityInvestmentType;
use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreYearStatisticsRequest;
use App\Http\Requests\Api\V1\UpdateYearStatisticsRequest;
use App\Models\CertificateStatus;
use App\Models\Company;
use App\Models\ProductionStandardization;
use App\Models\SecurityInvestment;
use App\Models\YearStatistic;
use App\Models\YearStatisticKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class YearStatisticsController extends Controller
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

        $query = YearStatistic::query();

        if ($request->filled('pid')) {
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

        $list = $query->with(['yearStatisticKid'])
            ->orderByDesc('id')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = YearStatistic::query()
            ->with(['yearStatisticKid'])
            ->find($id);

        if (! $data) {
            return $this->notFound('年度统计不存在');
        }

        return $this->success($data);
    }

    public function store(StoreYearStatisticsRequest $request): JsonResponse
    {
        // Enforce one report per year per company.
        $exists = YearStatistic::query()
            ->where('company_id', $request->company_id)
            ->whereYear('created_at', date('Y'))
            ->exists();

        if ($exists) {
            return $this->failed('你已经提交过当年年报了，如填报错误请前往修改');
        }

        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $data) {
            $yearStatistic = YearStatistic::create($data);

            $kids = $request->input('kids', []);
            foreach ($kids as $v) {
                $yearStatistic->yearStatisticKid()->create([
                    'name' => $v['name'] ?? null,
                    'type' => $v['type'] ?? 1,
                    'should_obtain_people' => $v['should_obtain_people'] ?? null,
                    'already_obtain_people' => $v['already_obtain_people'] ?? null,
                    'no_obtain_people' => $v['no_obtain_people'] ?? null,
                    'train_people' => $v['train_people'] ?? null,
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $yearStatistic->load('yearStatisticKid');
        });

        return $this->success($result);
    }

    public function update(UpdateYearStatisticsRequest $request, int $id): JsonResponse
    {
        $yearStatistic = YearStatistic::find($id);

        if (! $yearStatistic) {
            return $this->notFound('年度统计不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;

        $result = DB::transaction(function () use ($request, $yearStatistic, $data) {
            $yearStatistic->update($data);

            $kids = $request->input('kids');
            if ($kids !== null) {
                $yearStatistic->yearStatisticKid()->delete();
                foreach ($kids as $v) {
                    $yearStatistic->yearStatisticKid()->create([
                        'name' => $v['name'] ?? null,
                        'type' => $v['type'] ?? 1,
                        'should_obtain_people' => $v['should_obtain_people'] ?? null,
                        'already_obtain_people' => $v['already_obtain_people'] ?? null,
                        'no_obtain_people' => $v['no_obtain_people'] ?? null,
                        'train_people' => $v['train_people'] ?? null,
                        'company_id' => $request->company_id ?? $yearStatistic->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $yearStatistic->fresh(['yearStatisticKid']);
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = YearStatistic::find($id);

        if (! $record) {
            return $this->notFound('年度统计不存在');
        }

        DB::transaction(function () use ($record) {
            $record->yearStatisticKid()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }

    /**
     * 生成当年年报的预填充数据。
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

        $data = [
            'company_id' => (int) $company->id,
            'company_name' => (string) $company->title,
            'enterprise_type' => optional($company->enterpriseType)->title,
            'base_area' => optional($company->baseArea)->allname.($company->address ? '/'.$company->address : ''),
            'compliance_time' => null,
            'revaluation_time' => null,
            'safety_funding' => 0,
            'fire_fighting' => 0,
        ];

        $standardization = ProductionStandardization::query()->where('company_id', $company->id)->first();
        if ($standardization) {
            $data['compliance_time'] = $standardization->get_time;
            $data['revaluation_time'] = $standardization->valid_period;
        }

        // Own budget if produce-capable
        $ownSafety = 0;
        $ownFire = 0;
        if ($company->is_produce) {
            $ownSafety = (int) SecurityInvestment::query()
                ->where('company_id', $company->id)
                ->where('year', $year)
                ->where('type', SecurityInvestmentType::Safety->value)
                ->sum('budget');
            $ownFire = (int) SecurityInvestment::query()
                ->where('company_id', $company->id)
                ->where('year', $year)
                ->where('type', SecurityInvestmentType::Fire->value)
                ->sum('budget');
        }

        // Subordinate aggregation if bloc
        $subSafety = 0;
        $subFire = 0;
        $subIds = [];
        if ($company->is_bloc) {
            $subIds = Company::query()->where('pid', $company->id)->pluck('id')->map(fn ($id) => (int) $id)->all();
            if (! empty($subIds)) {
                $subSafety = (int) YearStatistic::query()
                    ->whereIn('company_id', $subIds)
                    ->whereYear('created_at', $year)
                    ->sum('safety_funding');
                $subFire = (int) YearStatistic::query()
                    ->whereIn('company_id', $subIds)
                    ->whereYear('created_at', $year)
                    ->sum('fire_fighting');
            }
        }

        $data['safety_funding'] = $ownSafety + $subSafety;
        $data['fire_fighting'] = $ownFire + $subFire;

        // Three-types-of-personnel certificates (type=1 三类人员 / type=2 消防)
        $kids = [];
        if ($company->is_produce) {
            $slStatuses = CertificateStatus::query()
                ->where('company_id', $company->id)
                ->where('type', 1)->get();
            foreach ($slStatuses as $s) {
                $kids[] = [
                    'name' => $s->name,
                    'type' => 1,
                    'should_obtain_people' => $s->should_obtain_people,
                    'already_obtain_people' => $s->already_obtain_people,
                    'no_obtain_people' => $s->no_obtain_people,
                    'train_people' => $s->train_people,
                ];
            }
            $xfStatuses = CertificateStatus::query()
                ->where('company_id', $company->id)
                ->where('type', 2)->get();
            foreach ($xfStatuses as $s) {
                $kids[] = [
                    'name' => $s->name,
                    'type' => 2,
                    'should_obtain_people' => $s->should_obtain_people,
                    'already_obtain_people' => $s->already_obtain_people,
                    'no_obtain_people' => $s->no_obtain_people,
                    'train_people' => $s->train_people,
                ];
            }
        }

        $data['kids'] = $kids;

        return $this->success($data);
    }

    /**
     * 年报汇总：对给定父企业的直接下级，在给定年份内汇总年报关键费用与持证情况。
     */
    public function statistics(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'date_time' => 'required|digits:4',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->date_time;

        $subordinateIds = Company::query()->where('pid', $companyId)->pluck('id')->all();

        $totals = YearStatistic::query()
            ->whereIn('company_id', $subordinateIds)
            ->whereYear('created_at', $year)
            ->selectRaw('COALESCE(SUM(safety_funding), 0) AS safety_funding, COALESCE(SUM(fire_fighting), 0) AS fire_fighting, COUNT(*) AS count_number')
            ->first();

        $slData = YearStatisticKid::query()
            ->whereIn('company_id', $subordinateIds)
            ->whereYear('created_at', $year)
            ->where('type', 1)
            ->selectRaw('name, COALESCE(SUM(should_obtain_people), 0) AS should_obtain_people, COALESCE(SUM(already_obtain_people), 0) AS already_obtain_people, COALESCE(SUM(train_people), 0) AS train_people')
            ->groupBy('name')
            ->get();

        $xfData = YearStatisticKid::query()
            ->whereIn('company_id', $subordinateIds)
            ->whereYear('created_at', $year)
            ->where('type', 2)
            ->selectRaw('name, COALESCE(SUM(should_obtain_people), 0) AS should_obtain_people, COALESCE(SUM(already_obtain_people), 0) AS already_obtain_people, COALESCE(SUM(train_people), 0) AS train_people')
            ->groupBy('name')
            ->get();

        return $this->success([
            'safety_funding' => (int) ($totals->safety_funding ?? 0),
            'fire_fighting' => (int) ($totals->fire_fighting ?? 0),
            'count_number' => (int) ($totals->count_number ?? 0),
            'sl_data' => $slData,
            'xf_data' => $xfData,
            'date' => (string) $year,
            'subordinate_count' => count($subordinateIds),
        ]);
    }
}
