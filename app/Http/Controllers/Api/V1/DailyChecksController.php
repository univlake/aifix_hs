<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\Company;
use App\Models\DailyCheck;
use App\Models\DailyCheckTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DailyChecksController extends Controller
{
    public const STATUS_DRAFT = 0;

    public const STATUS_COMPLETED = 1;

    public const STATUS_SCORED = 2;

    /**
     * 填报列表（按企业+年份聚合）。
     *
     * - company_id：本企业视角（仅显示填报中状态）
     * - pid：上级企业视角（仅显示已完成 / 已评分）
     */
    public function submissions(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'nullable|integer',
            'pid' => 'nullable|integer',
            'status' => 'nullable|integer|in:0,1,2',
        ]);

        if (! $request->filled('company_id') && ! $request->filled('pid')) {
            return $this->failed('company_id 或 pid 至少提供一个', 422);
        }

        $query = DailyCheck::query();

        if ($request->filled('pid')) {
            $subordinateIds = Company::query()
                ->where('pid', (int) $request->pid)
                ->pluck('id')
                ->all();
            $query->whereIn('company_id', $subordinateIds);

            // 上级视角默认只看已完成和已评分，隐藏草稿
            if ($request->filled('status')) {
                $query->where('status', (int) $request->status);
            } else {
                $query->whereIn('status', [self::STATUS_COMPLETED, self::STATUS_SCORED]);
            }
        } else {
            $query->where('company_id', (int) $request->company_id);

            if ($request->filled('status')) {
                $query->where('status', (int) $request->status);
            }
        }

        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }

        $rows = $query
            ->selectRaw('company_id, year, MIN(status) AS status, COALESCE(SUM(number), 0) AS total_number, MAX(updated_at) AS updated_at, COUNT(*) AS row_count')
            ->groupBy(['company_id', 'year'])
            ->orderByDesc('year')
            ->get();

        $companies = Company::query()
            ->whereIn('id', $rows->pluck('company_id')->unique()->all())
            ->pluck('title', 'id');

        $list = $rows->map(fn ($r) => [
            'company_id' => (int) $r->company_id,
            'company_name' => (string) ($companies[$r->company_id] ?? ''),
            'year' => (int) $r->year,
            'status' => (int) $r->status,
            'total_number' => round((float) $r->total_number, 1),
            'row_count' => (int) $r->row_count,
            'updated_at' => $r->updated_at,
            'title' => '日常目标管理工作考核',
        ])->values();

        return $this->success($list);
    }

    /**
     * 开始填报 / 继续填报：返回指定年份的模板树 + 本企业已有的填报数据。
     *
     * - is_new=1 时，若该年份已存在任何记录则返回重复提示
     */
    public function startForm(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'is_new' => 'nullable|boolean',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        if ($request->boolean('is_new')) {
            $exists = DailyCheck::query()
                ->where('company_id', $companyId)
                ->where('year', $year)
                ->exists();
            if ($exists) {
                return $this->failed('该年份已有填报记录，如需修改请从列表中继续填报');
            }
        }

        $templates = DailyCheckTemplate::query()
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
     * 保存草稿（暂存）。可重复调用，保持 status = 0。
     */
    public function saveDraft(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'items' => 'required|array',
            'items.*.daily_check_template_id' => 'required|integer',
            'items.*.path' => 'nullable|string',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        // 禁止修改已完成/已评分记录
        $locked = DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->where('status', '!=', self::STATUS_DRAFT)
            ->exists();
        if ($locked) {
            return $this->failed('该年份填报已提交，无法再修改', 403);
        }

        $userId = auth()->id() ?? 0;

        DB::transaction(function () use ($request, $companyId, $year, $userId) {
            foreach ($request->input('items', []) as $item) {
                $row = DailyCheck::query()->firstOrNew([
                    'daily_check_template_id' => (int) $item['daily_check_template_id'],
                    'company_id' => $companyId,
                    'year' => $year,
                ]);
                $row->path = $item['path'] ?? null;
                $row->status = self::STATUS_DRAFT;
                if (! $row->exists) {
                    $row->user_id = $userId;
                }
                $row->last_user_id = $userId;
                $row->save();
            }
        });

        return $this->message('暂存成功');
    }

    /**
     * 提交填报：将 (company, year) 内所有草稿置为已完成。
     */
    public function complete(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $updated = DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->where('status', self::STATUS_DRAFT)
            ->update([
                'status' => self::STATUS_COMPLETED,
                'last_user_id' => auth()->id() ?? 0,
            ]);

        if ($updated === 0) {
            return $this->failed('未找到可提交的草稿');
        }

        return $this->message('填报已提交，等待上级评分');
    }

    /**
     * 上级评分：为每条子指标写入 number + comment，并将记录转为已评分。
     */
    public function score(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'items' => 'required|array',
            'items.*.daily_check_template_id' => 'required|integer',
            'items.*.number' => 'nullable|numeric',
            'items.*.comment' => 'nullable|string',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;
        $userId = auth()->id() ?? 0;

        DB::transaction(function () use ($request, $companyId, $year, $userId) {
            foreach ($request->input('items', []) as $item) {
                DailyCheck::query()
                    ->where('company_id', $companyId)
                    ->where('year', $year)
                    ->where('daily_check_template_id', (int) $item['daily_check_template_id'])
                    ->update([
                        'number' => isset($item['number']) ? round((float) $item['number'], 1) : 0,
                        'comment' => $item['comment'] ?? null,
                        'status' => self::STATUS_SCORED,
                        'last_user_id' => $userId,
                    ]);
            }
        });

        return $this->message('评分完成');
    }

    /**
     * 获取已填报/已评分的详细数据（含模板层级）。
     */
    public function showSubmission(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $templates = DailyCheckTemplate::query()
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

        $meta = DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->selectRaw('MIN(status) AS status, COALESCE(SUM(number), 0) AS total_number')
            ->first();

        return $this->success([
            'company_id' => $companyId,
            'year' => $year,
            'status' => (int) ($meta->status ?? self::STATUS_DRAFT),
            'total_number' => round((float) ($meta->total_number ?? 0), 1),
            'templates' => $templates,
        ]);
    }

    /**
     * 删除整组草稿：只允许 status=0。
     */
    public function destroyForm(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
        ]);

        $companyId = (int) $request->company_id;
        $year = (int) $request->year;

        $locked = DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->where('status', '!=', self::STATUS_DRAFT)
            ->exists();
        if ($locked) {
            return $this->failed('该年份填报已提交，无法删除', 403);
        }

        DailyCheck::query()
            ->where('company_id', $companyId)
            ->where('year', $year)
            ->where('status', self::STATUS_DRAFT)
            ->delete();

        return $this->message('删除成功');
    }

    // ── legacy single-row endpoints kept for backward compatibility ──

    public function index(Request $request): JsonResponse
    {
        $query = DailyCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        $list = $query->with('dailyCheckTemplate')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = DailyCheck::with('dailyCheckTemplate')->find($id);

        if (! $data) {
            return $this->notFound('日常检查记录不存在');
        }

        return $this->success($data);
    }
}
