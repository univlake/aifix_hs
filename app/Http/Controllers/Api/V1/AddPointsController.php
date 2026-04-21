<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreAddPointsRequest;
use App\Http\Requests\Api\V1\UpdateAddPointsRequest;
use App\Models\AddPoint;
use App\Models\AddPointsTemplate;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AddPointsController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AddPoint::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('addPointsTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function startForm(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $templates = AddPointsTemplate::query()
            ->where('year', $year)
            ->where('level', 1)
            ->orderBy('sort')
            ->with(['check' => function ($c) use ($companyId, $year) {
                $c->where('company_id', $companyId)->where('year', $year);
            }])
            ->get();

        return $this->success($templates);
    }

    public function saveScore(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'items' => 'required|array',
            'items.*.add_points_template_id' => 'required|integer',
            'items.*.number' => 'nullable|numeric',
            'items.*.comment' => 'nullable|string',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;
        $userId = auth()->id() ?? 0;

        DB::transaction(function () use ($request, $companyId, $year, $userId) {
            foreach ($request->input('items', []) as $item) {
                $row = AddPoint::query()->firstOrNew([
                    'add_points_template_id' => (int) $item['add_points_template_id'],
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

    public function submissions(Request $request): JsonResponse
    {
        $request->validate(['pid' => 'required|integer']);
        $pid = (int) $request->pid;

        $subordinateIds = Company::query()->where('pid', $pid)->pluck('id')->all();

        $query = AddPoint::query()->whereIn('company_id', $subordinateIds);
        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        $rows = $query
            ->selectRaw('company_id, year, COALESCE(SUM(number), 0) AS total_number, MAX(updated_at) AS updated_at, COUNT(*) AS row_count')
            ->groupBy(['company_id', 'year'])
            ->orderByDesc('year')
            ->get();

        $companies = Company::query()->whereIn('id', $rows->pluck('company_id')->unique())->pluck('title', 'id');

        $list = $rows->map(fn ($r) => [
            'company_id' => (int) $r->company_id,
            'company_name' => (string) ($companies[$r->company_id] ?? ''),
            'year' => (int) $r->year,
            'total_number' => round((float) $r->total_number, 1),
            'row_count' => (int) $r->row_count,
            'updated_at' => $r->updated_at,
            'title' => '加分项考核',
        ])->values();

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = AddPoint::with('addPointsTemplate')->find($id);

        if (! $data) {
            return $this->notFound('加分项记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreAddPointsRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = AddPoint::create($data);

        return $this->success($record);
    }

    public function update(UpdateAddPointsRequest $request, int $id): JsonResponse
    {
        $record = AddPoint::find($id);

        if (! $record) {
            return $this->notFound('加分项记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = AddPoint::find($id);

        if (! $record) {
            return $this->notFound('加分项记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }
}
