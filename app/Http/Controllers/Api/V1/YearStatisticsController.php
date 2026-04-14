<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\YearStatistic;
use App\Models\YearStatisticKid;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class YearStatisticsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = YearStatistic::query();

        if ($request->filled('company_id')) {
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

        if (!$data) {
            return $this->notFound('年度统计不存在');
        }

        return $this->success($data);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_id' => 'required|integer',
            'company_name' => 'nullable|string|max:255',
            'base_area' => 'nullable|string|max:255',
            'enterprise_type' => 'nullable|string|max:255',
            'safety_funding' => 'nullable|string|max:255',
            'fire_fighting' => 'nullable|string|max:255',
            'compliance_time' => 'nullable|date',
            'revaluation_time' => 'nullable|date',
        ]);

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

    public function update(Request $request, int $id): JsonResponse
    {
        $yearStatistic = YearStatistic::find($id);

        if (!$yearStatistic) {
            return $this->notFound('年度统计不存在');
        }

        $data = $request->validate([
            'company_id' => 'sometimes|required|integer',
            'company_name' => 'sometimes|nullable|string|max:255',
            'base_area' => 'sometimes|nullable|string|max:255',
            'enterprise_type' => 'sometimes|nullable|string|max:255',
            'safety_funding' => 'sometimes|nullable|string|max:255',
            'fire_fighting' => 'sometimes|nullable|string|max:255',
            'compliance_time' => 'sometimes|nullable|date',
            'revaluation_time' => 'sometimes|nullable|date',
        ]);

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

            return $yearStatistic->fresh()->load('yearStatisticKid');
        });

        return $this->success($result);
    }

    public function destroy(int $id): JsonResponse
    {
        $record = YearStatistic::find($id);

        if (!$record) {
            return $this->notFound('年度统计不存在');
        }

        DB::transaction(function () use ($record) {
            $record->yearStatisticKid()->delete();
            $record->delete();
        });

        return $this->message('删除成功');
    }
}
