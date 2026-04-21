<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreAccidentChecksRequest;
use App\Http\Requests\Api\V1\UpdateAccidentChecksRequest;
use App\Models\AccidentCheck;
use App\Models\AccidentCheckTemplate;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AccidentChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AccidentCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('accidentCheckTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    /**
     * 获取评分模板 + 已有评分：返回一级模板，嵌套二级，每个二级附带已有 check 行。
     */
    public function startForm(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $templates = AccidentCheckTemplate::query()
            ->where('year', $year)
            ->where('level', 1)
            ->orderBy('sort')
            ->with(['child' => function ($q) use ($year, $companyId) {
                $q->where('year', $year)
                    ->orderBy('sort')
                    ->with(['check' => function ($c) use ($companyId, $year) {
                        $c->where('company_id', $companyId)->where('year', $year);
                    }]);
            }])
            ->get();

        return $this->success($templates);
    }

    /**
     * 批量写入评分（存在则更新）。
     */
    public function saveScore(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'items' => 'required|array',
            'items.*.accident_check_template_id' => 'required|integer',
            'items.*.number' => 'nullable|numeric',
            'items.*.comment' => 'nullable|string',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;
        $userId = auth()->id() ?? 0;

        DB::transaction(function () use ($request, $companyId, $year, $userId) {
            foreach ($request->input('items', []) as $item) {
                $row = AccidentCheck::query()->firstOrNew([
                    'accident_check_template_id' => (int) $item['accident_check_template_id'],
                    'company_id' => $companyId,
                    'year' => $year,
                ]);
                $row->number = isset($item['number']) ? round((float) $item['number'], 1) : 0;
                $row->comment = $item['comment'] ?? null;
                if (! $row->exists) {
                    $row->user_id = $userId;
                }
                $row->last_user_id = $userId;
                $row->save();
            }
        });

        return $this->message('评分已保存');
    }

    /**
     * 下级企业评分汇总列表（按年份）。
     * 安全生产事故考核指标最终分 = max(0, 20 - SUM(number))。
     */
    public function submissions(Request $request): JsonResponse
    {
        $request->validate(['pid' => 'required|integer']);
        $pid = (int) $request->pid;

        $subordinateIds = Company::query()->where('pid', $pid)->pluck('id')->all();

        $query = AccidentCheck::query()->whereIn('company_id', $subordinateIds);
        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        $rows = $query
            ->selectRaw('company_id, year, COALESCE(SUM(number), 0) AS raw_number, MAX(updated_at) AS updated_at, COUNT(*) AS row_count')
            ->groupBy(['company_id', 'year'])
            ->orderByDesc('year')
            ->get();

        $companies = Company::query()->whereIn('id', $rows->pluck('company_id')->unique())->pluck('title', 'id');

        $list = $rows->map(function ($r) use ($companies) {
            $raw = round((float) $r->raw_number, 1);
            $final = max(0, 20 - $raw);

            return [
                'company_id' => (int) $r->company_id,
                'company_name' => (string) ($companies[$r->company_id] ?? ''),
                'year' => (int) $r->year,
                'raw_number' => $raw,
                'final_number' => round($final, 1),
                'row_count' => (int) $r->row_count,
                'updated_at' => $r->updated_at,
                'title' => '安全生产安全生产事故考核指标',
            ];
        })->values();

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = AccidentCheck::with('accidentCheckTemplate')->find($id);

        if (! $data) {
            return $this->notFound('事故检查记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreAccidentChecksRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = AccidentCheck::create($data);

        return $this->success($record);
    }

    public function update(UpdateAccidentChecksRequest $request, int $id): JsonResponse
    {
        $record = AccidentCheck::find($id);

        if (! $record) {
            return $this->notFound('事故检查记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = AccidentCheck::find($id);

        if (! $record) {
            return $this->notFound('事故检查记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
