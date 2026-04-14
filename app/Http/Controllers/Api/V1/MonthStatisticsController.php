<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\MonthStatistic;
use App\Models\MonthStatisticAccident;
use App\Models\MonthStatisticControl;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Http\Requests\Api\V1\StoreMonthStatisticsRequest;

class MonthStatisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
        ]);

        $data = MonthStatistic::query()
            ->where('company_id', $request->company_id)
            ->with(['monthStatisticAccident', 'monthStatisticControl'])
            ->orderByDesc('created_at')
            ->paginate($request->get('per_page', 15));

        return $this->success($data);
    }

    public function show(int $id): JsonResponse
    {
        $data = MonthStatistic::query()
            ->with(['monthStatisticAccident', 'monthStatisticControl'])
            ->find($id);

        if (!$data) {
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

            // Handle govern_hidden_danger children
            $governItems = $request->input('govern_hidden_danger', []);
            foreach ($governItems as $v) {
                $monthStatistic->monthStatisticControl()->create([
                    'govern_title' => $v['govern_title'] ?? null,
                    'govern_supplies' => $v['govern_supplies'] ?? null,
                    'govern_user' => $v['govern_user'] ?? null,
                    'govern_date' => $v['govern_date'] ?? null,
                    'govern_text' => $v['govern_text'] ?? null,
                    'govern_money' => $v['govern_money'] ?? null,
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            // Handle accident_bulletin children
            $accidentItems = $request->input('accident_bulletin', []);
            foreach ($accidentItems as $v) {
                $monthStatistic->monthStatisticAccident()->create([
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
                    'company_id' => $request->company_id,
                    'user_id' => auth()->id() ?? 0,
                    'last_user_id' => auth()->id() ?? 0,
                ]);
            }

            return $monthStatistic->load(['monthStatisticAccident', 'monthStatisticControl']);
        });

        return $this->success($data);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $monthStatistic = MonthStatistic::find($id);

        if (!$monthStatistic) {
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

            // Re-create govern children if provided
            $governItems = $request->input('govern_hidden_danger');
            if ($governItems !== null) {
                $monthStatistic->monthStatisticControl()->delete();
                foreach ($governItems as $v) {
                    $monthStatistic->monthStatisticControl()->create([
                        'govern_title' => $v['govern_title'] ?? null,
                        'govern_supplies' => $v['govern_supplies'] ?? null,
                        'govern_user' => $v['govern_user'] ?? null,
                        'govern_date' => $v['govern_date'] ?? null,
                        'govern_text' => $v['govern_text'] ?? null,
                        'govern_money' => $v['govern_money'] ?? null,
                        'company_id' => $request->company_id ?? $monthStatistic->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            // Re-create accident children if provided
            $accidentItems = $request->input('accident_bulletin');
            if ($accidentItems !== null) {
                $monthStatistic->monthStatisticAccident()->delete();
                foreach ($accidentItems as $v) {
                    $monthStatistic->monthStatisticAccident()->create([
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
                        'company_id' => $request->company_id ?? $monthStatistic->company_id,
                        'user_id' => auth()->id() ?? 0,
                        'last_user_id' => auth()->id() ?? 0,
                    ]);
                }
            }

            return $monthStatistic->fresh()->load(['monthStatisticAccident', 'monthStatisticControl']);
        });

        return $this->success($data);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = MonthStatistic::find($id);

        if (!$record) {
            return $this->notFound('月报不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
