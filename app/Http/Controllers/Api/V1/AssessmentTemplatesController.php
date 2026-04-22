<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Models\AccidentCheckTemplate;
use App\Models\AddPointsTemplate;
use App\Models\DailyCheckTemplate;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * 考核模板管理：跨三张模板表（日常、事故、加分）的汇总接口。
 *
 * 单表 CRUD 仍由 DailyCheckTemplatesController / AccidentCheckTemplatesController /
 * AddPointsTemplatesController 承担，这里只提供年度列表与一键拷贝。
 */
class AssessmentTemplatesController extends Controller
{
    /** @var array<string, class-string<Model>> */
    private const KINDS = [
        'daily' => DailyCheckTemplate::class,
        'accident' => AccidentCheckTemplate::class,
        'add_points' => AddPointsTemplate::class,
    ];

    /**
     * 返回三张模板表已存在的年度并集，供前端选择。
     */
    public function years(): JsonResponse
    {
        $years = collect();

        foreach (self::KINDS as $modelClass) {
            $years = $years->merge($modelClass::query()->distinct()->pluck('year'));
        }

        $sorted = $years->filter()
            ->map(fn ($y) => (int) $y)
            ->unique()
            ->sortDesc()
            ->values();

        return $this->success($sorted);
    }

    /**
     * 一键从 from_year 拷贝到 to_year，保留 pid 树结构。
     *
     * Body:
     *   from_year: int, required
     *   to_year:   int, required（与 from_year 不同）
     *   kinds:     string[] 可选，默认全部三种
     *   overwrite: bool 可选，默认 false；为 true 时先清空 to_year 对应表
     */
    public function copy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from_year' => 'required|integer|min:2000|max:2100',
            'to_year' => 'required|integer|min:2000|max:2100|different:from_year',
            'kinds' => 'nullable|array',
            'kinds.*' => 'in:daily,accident,add_points',
            'overwrite' => 'nullable|boolean',
        ]);

        $kinds = $validated['kinds'] ?? array_keys(self::KINDS);
        $fromYear = (int) $validated['from_year'];
        $toYear = (int) $validated['to_year'];
        $overwrite = (bool) ($validated['overwrite'] ?? false);

        $summary = [];

        try {
            DB::transaction(function () use ($kinds, $fromYear, $toYear, $overwrite, &$summary) {
                foreach ($kinds as $kind) {
                    $modelClass = self::KINDS[$kind];
                    $summary[$kind] = $this->copyKind($modelClass, $fromYear, $toYear, $overwrite);
                }
            });
        } catch (\RuntimeException $e) {
            return $this->failed($e->getMessage());
        }

        return $this->success([
            'from_year' => $fromYear,
            'to_year' => $toYear,
            'summary' => $summary,
        ]);
    }

    /**
     * @param  class-string<Model>  $modelClass
     * @return array{copied:int,skipped?:string}
     */
    private function copyKind(string $modelClass, int $fromYear, int $toYear, bool $overwrite): array
    {
        $targetCount = $modelClass::query()->where('year', $toYear)->count();

        if ($targetCount > 0 && ! $overwrite) {
            throw new \RuntimeException("目标年度 {$toYear} 已存在 {$targetCount} 条记录，如需覆盖请启用 overwrite");
        }

        if ($overwrite && $targetCount > 0) {
            $modelClass::query()->where('year', $toYear)->forceDelete();
        }

        $sources = $modelClass::query()
            ->where('year', $fromYear)
            ->orderBy('level')
            ->orderBy('pid')
            ->orderBy('sort')
            ->get();

        if ($sources->isEmpty()) {
            return ['copied' => 0];
        }

        $idMap = [0 => 0];

        foreach ($sources as $row) {
            $newPid = $idMap[$row->pid] ?? 0;
            $copy = $modelClass::create([
                'title' => $row->title,
                'level' => $row->level,
                'sort' => $row->sort,
                'pid' => $newPid,
                'year' => $toYear,
                'score_range' => $row->score_range,
            ]);
            $idMap[$row->id] = $copy->id;
        }

        return ['copied' => $sources->count()];
    }
}
