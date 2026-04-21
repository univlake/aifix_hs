<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\Controller;
use App\Http\Requests\Api\V1\StoreNormChecksRequest;
use App\Http\Requests\Api\V1\UpdateNormChecksRequest;
use App\Models\Company;
use App\Models\NormCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NormChecksController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = NormCheck::query();

        if ($request->filled('company_id')) {
            $query->where('company_id', $request->company_id);
        }

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $list = $query->with('company:id,title')
            ->orderBy('id', 'desc')
            ->paginate($request->get('per_page', 15));

        return $this->success($list);
    }

    public function show(int $id): JsonResponse
    {
        $data = NormCheck::with('company:id,title')->find($id);

        if (! $data) {
            return $this->notFound('标准化检查记录不存在');
        }

        return $this->success($data);
    }

    public function store(StoreNormChecksRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = auth()->id() ?? 0;
        $data['last_user_id'] = auth()->id() ?? 0;

        $record = NormCheck::create($data);

        return $this->success($record);
    }

    public function update(UpdateNormChecksRequest $request, int $id): JsonResponse
    {
        $record = NormCheck::find($id);

        if (! $record) {
            return $this->notFound('标准化检查记录不存在');
        }
        $data = $request->validated();
        $data['last_user_id'] = auth()->id() ?? 0;
        $record->update($data);

        return $this->success($record->fresh());
    }

    public function destroy(int $id): JsonResponse
    {
        $record = NormCheck::find($id);

        if (! $record) {
            return $this->notFound('标准化检查记录不存在');
        }

        $record->delete();

        return $this->message('删除成功');
    }

    /**
     * 下级企业大中型企业安全生产标准化管理体系构建汇总（按年份）。
     * 转换：number/100 * 30 (year > 2025) 或 * 20 (year <= 2025)。
     */
    public function submissions(Request $request): JsonResponse
    {
        $request->validate(['pid' => 'required|integer']);
        $pid = (int) $request->pid;

        $subordinateIds = Company::query()->where('pid', $pid)->pluck('id')->all();

        $query = NormCheck::query()->whereIn('company_id', $subordinateIds);
        if ($request->filled('year')) {
            $query->where('year', (int) $request->year);
        }
        $records = $query->with('company:id,title')->orderByDesc('year')->get();

        $list = $records->map(function (NormCheck $r) {
            $scale = $r->year > 2025 ? 30 : 20;
            $final = round(((int) $r->number / 100) * $scale, 2);

            return [
                'id' => $r->id,
                'company_id' => (int) $r->company_id,
                'company_name' => $r->company?->title ?? '',
                'year' => (int) $r->year,
                'type' => $r->type,
                'raw_number' => (int) $r->number,
                'final_number' => $final,
                'path' => $r->path,
                'updated_at' => $r->updated_at,
                'title' => '大中型企业安全生产标准化管理体系构建',
            ];
        })->values();

        return $this->success($list);
    }

    /**
     * 大中型企业安全生产标准化管理体系构建评分（单次保存）：company+year 唯一。
     */
    public function saveScore(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => 'required|integer',
            'year' => 'required|integer|min:2022',
            'type' => 'required|string|max:50',
            'number' => 'required|numeric|min:0|max:100',
            'path' => 'nullable|string',
        ]);

        $userId = auth()->id() ?? 0;

        $record = NormCheck::query()->firstOrNew([
            'company_id' => (int) $request->company_id,
            'year' => (int) $request->year,
        ]);
        $record->type = $request->string('type');
        $record->number = (int) round((float) $request->input('number'));
        $record->path = $request->input('path') ?: null;
        if (! $record->exists) {
            $record->user_id = $userId;
        }
        $record->last_user_id = $userId;
        $record->save();

        return $this->success($record->fresh());
    }

    /**
     * 返回内置打分表下载地址（大中型企业安全生产标准化管理体系构建填写参考）。
     *
     * 对应 snap 的 getList 行为；文件位置见 public/demo_check/。
     */
    public function templateLink(Request $request): JsonResponse
    {
        $request->validate(['type' => 'required|string']);
        $type = (string) $request->string('type');

        $map = [
            '机械' => '/demo_check/浙江省机械制造行业安全生产标准化企业考核评定表.xls',
            '造纸' => '/demo_check/造纸企业安全生产标准化评定标准.xlsx',
            '危化' => '/demo_check/危险化学品从业单位安全生产标准化评审标准.xlsx',
        ];

        return $this->success([
            'url' => $map[$type] ?? '/demo_check/冶金等工贸企业安全生产标准化基本规范评分细则.xlsx',
            'type' => $type,
        ]);
    }
}
